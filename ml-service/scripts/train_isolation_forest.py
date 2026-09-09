"""One fixed benign-only official-split experiment; never overwrite a version."""

import hashlib
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
os.environ["MPLCONFIGDIR"] = str(ROOT / ".cache" / "matplotlib")

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from cyber_soc_ml.anomaly import (
    BUNDLE_PATH,
    MODEL_VERSION,
    fit_bundle,
    predict,
    save_bundle,
)
from cyber_soc_ml.data import RAW_DIR, load_splits
from cyber_soc_ml.modeling import evaluate_scores
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    PrecisionRecallDisplay,
    RocCurveDisplay,
)


def protected_hashes():
    paths = sorted(RAW_DIR.glob("*.csv")) + [
        ROOT / "models" / "xgboost-network-v1.joblib",
        ROOT / "reports" / "xgboost-network-v1_metrics.json",
    ]
    return {str(p.relative_to(ROOT.parent)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in paths}


def main():
    report_path = ROOT / "reports" / f"{MODEL_VERSION}_metrics.json"
    figures = {name: ROOT / "reports" / "figures" / f"{MODEL_VERSION}_{name}.png"
               for name in ("confusion_matrix", "roc", "precision_recall")}
    if any(p.exists() for p in [BUNDLE_PATH, report_path, *figures.values()]):
        raise FileExistsError("Version exists; refusing another fit or overwrite")
    before = protected_hashes()
    train, test = load_splits()
    bundle = fit_bundle(train.X, train.y)
    results = predict(test.X, bundle)
    scores = np.array([r["anomaly_score"] for r in results])
    # Existing evaluator uses >=; nextafter implements the documented strict > rule.
    metrics = evaluate_scores(test.y, scores, np.nextafter(bundle["metadata"]["threshold"], 1))
    tn, fp = metrics["confusion_matrix"][0]
    metrics["observed_test_false_positive_rate"] = fp / (tn + fp)
    metrics["observed_test_false_negative_count"] = metrics["confusion_matrix"][1][0]
    after = protected_hashes()
    if before != after:
        raise RuntimeError("Protected files changed")
    report = {
        "metadata": bundle["metadata"], "test_rows": len(test.y),
        "isolation_forest": metrics,
        "metric_conventions": {
            "positive_class": "attack=1 evaluated against predicted anomaly",
            "confusion_matrix_order": "rows=true, columns=predicted; labels=[0,1]",
            "pr_auc_definition": "average precision, not trapezoidal PR area",
            "ranking_scores": "benign-reference ECDF anomaly_score; ties retained",
        },
        "protected_sha256_before": before, "protected_sha256_after": after,
        "limitations": [
            "Fixed modest configuration; no exhaustive optimisation.",
            "Training-reference 5% tolerance is not a guarantee of test or production FPR.",
            "In-sample benign reference; no independent benign calibration split.",
            "ECDF saturates beyond training extrema and creates ties in ranking metrics.",
            "Unseen categories encode as zeros; unusual events need not be attacks.",
            "2015 lab flow benchmark; no production, endpoint or per-attack validation.",
            "Official test previously inspected in EDA; no test-based fitting or tuning.",
            "Duplicates and train/test overlap have not been audited.",
        ],
    }
    json.dumps(report, allow_nan=False)
    save_bundle(bundle)
    report["artifact"] = {
        "path": str(BUNDLE_PATH.relative_to(ROOT.parent)),
        "sha256": hashlib.sha256(BUNDLE_PATH.read_bytes()).hexdigest(),
    }
    for name, display in (
        ("confusion_matrix", ConfusionMatrixDisplay(
            np.array(metrics["confusion_matrix"]), display_labels=["normal", "attack"])),
        ("roc", RocCurveDisplay.from_predictions(test.y, scores)),
        ("precision_recall", PrecisionRecallDisplay.from_predictions(test.y, scores)),
    ):
        if name == "confusion_matrix":
            display.plot()
        display.figure_.savefig(figures[name], dpi=150, bbox_inches="tight")
        plt.close(display.figure_)
    with report_path.open("x") as target:
        target.write(json.dumps(report, indent=2, allow_nan=False) + "\n")
    print(json.dumps({"metrics": metrics, "training": bundle["metadata"][
        "training_duration_seconds"], "artifact": report["artifact"]}, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
