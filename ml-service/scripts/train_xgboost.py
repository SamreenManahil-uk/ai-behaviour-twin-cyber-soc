"""One fixed official-split experiment; refuses to overwrite an existing version."""

import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
os.environ["MPLCONFIGDIR"] = str(ROOT / ".cache" / "matplotlib")

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from cyber_soc_ml.data import RAW_DIR, load_splits
from cyber_soc_ml.modeling import (
    BUNDLE_PATH,
    evaluate_scores,
    fit_bundle,
    json_safe_metadata,
    save_bundle,
)
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    PrecisionRecallDisplay,
    RocCurveDisplay,
)


def raw_hashes():
    return {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(RAW_DIR.glob("UNSW_NB15_*-set.csv"))}


def build_report(bundle, test_rows, metrics, baseline):
    """Copy metadata safely; leave measured metrics numeric and unrounded."""
    return {
        "metadata": json_safe_metadata(bundle["metadata"]), "test_rows": test_rows,
        "metric_conventions": {
            "positive_class": 1, "threshold_rule": "score >= 0.5",
            "confusion_matrix_order": "rows=true, columns=predicted; labels=[0, 1]",
            "precision_recall_f1_average": "binary (attack=1)",
            "pr_auc_definition": "average_precision (not trapezoidal PR area)",
            "undefined_precision": 0,
            "numeric_storage": "Raw computed float values; no internal rounding. Figures use display rounding only.",
        },
        "xgboost": metrics, "dummy_most_frequent": baseline,
        "xgboost_minus_dummy": {k: metrics[k] - baseline[k] for k in (
            "accuracy", "precision", "recall", "f1", "roc_auc", "average_precision"
        )},
        "artifact": {
            "path": str(BUNDLE_PATH.relative_to(ROOT.parent)),
            "sha256": hashlib.sha256(BUNDLE_PATH.read_bytes()).hexdigest(),
            "bytes": BUNDLE_PATH.stat().st_size,
        },
        "limitations": [
            "Fixed modest configuration, no exhaustive hyperparameter optimisation.",
            "Uncalibrated scores; 0-100 scaling is not final hybrid SOC risk.",
            "2015 lab network-flow benchmark does not validate production or endpoint detection.",
            "Official split names/sizes; bytes from secondary Figshare deposit (see dataset card).",
            "Identifier-free duplicates and train/test overlap have not been audited.",
            "Binary aggregate evaluation does not establish detection of each attack category.",
            "Test split previously inspected for descriptive EDA, never used for model decisions.",
        ],
    }


def main():
    report_path = ROOT / "reports" / "xgboost-network-v1_metrics.json"
    if BUNDLE_PATH.exists() or report_path.exists():
        raise FileExistsError("Version already exists; refusing another fit or report overwrite")
    before = raw_hashes()
    train, test = load_splits()
    bundle, dummy = fit_bundle(train.X, train.y)
    bundle["metadata"]["raw_dataset_sha256"] = before
    bundle["metadata"]["source_git_revision"] = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
    ).strip()
    bundle["metadata"]["source_working_tree_has_uncommitted_changes"] = bool(
        subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True).strip()
    )
    # The only full held-out scoring pass. Reuse these scores for every metric/plot.
    scores = bundle["model"].predict_proba(bundle["preprocessor"].transform(test.X))[:, 1]
    dummy_scores = dummy.predict_proba(np.zeros((len(test.y), 1)))[:, 1]
    metrics = evaluate_scores(test.y, scores)
    baseline = evaluate_scores(test.y, dummy_scores)
    if before != raw_hashes():
        raise RuntimeError("Raw dataset hashes changed during training")
    save_bundle(bundle)
    report = build_report(bundle, len(test.y), metrics, baseline)
    figures = ROOT / "reports" / "figures"
    figures.mkdir(parents=True, exist_ok=True)
    display = ConfusionMatrixDisplay(np.asarray(metrics["confusion_matrix"]),
                                     display_labels=["normal", "attack"])
    display.plot(values_format="d")
    display.figure_.savefig(figures / "xgboost-network-v1_confusion_matrix.png", dpi=150)
    plt.close(display.figure_)
    for cls, name in ((RocCurveDisplay, "roc"), (PrecisionRecallDisplay, "precision_recall")):
        fig, ax = plt.subplots()
        cls.from_predictions(test.y, scores, name="XGBoost", ax=ax)
        cls.from_predictions(test.y, dummy_scores, name="Majority baseline", ax=ax)
        fig.tight_layout()
        fig.savefig(figures / f"xgboost-network-v1_{name}.png", dpi=150)
        plt.close(fig)
    report_path.write_text(json.dumps(report, indent=2, allow_nan=False) + "\n")
    print(json.dumps(report, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
