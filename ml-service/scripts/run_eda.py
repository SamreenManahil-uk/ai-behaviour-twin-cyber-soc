"""Reproducible descriptive network-flow EDA; no fitting or model training."""

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
import pandas as pd
from cyber_soc_ml.data import (
    RAW_DIR,
    feature_columns,
    non_finite_counts,
    read_csv,
    split_features,
    validate_schemas,
)


def main():
    frames = {name: read_csv(RAW_DIR / f"UNSW_NB15_{name}-set.csv")
              for name in ("training", "testing")}
    validate_schemas(frames["training"], frames["testing"])
    categorical, numeric = feature_columns(split_features(frames["training"]).X)
    report = {
        "categorical_features": categorical, "numeric_features": numeric,
        "notes": [
            "Network-flow benchmark; not endpoint Behaviour Twin validation.",
            "Test summaries are descriptive only; do not tune using them.",
            "Relationships are training-only Spearman rank correlations with label.",
            "Associations are not causation, feature selection or model performance.",
            "Numeric summaries exclude missing and infinity; counts report both explicitly.",
            "Literal '-' and 'NA' are preserved; only empty CSV cells are missing.",
            "No fitting, resampling, SMOTE or predictive modelling performed.",
        ],
        "splits": {},
    }
    for name, frame in frames.items():
        finite = frame[numeric].replace([np.inf, -np.inf], np.nan)
        report["splits"][name] = {
            "shape": list(frame.shape),
            "target_counts": frame.label.value_counts().sort_index().to_dict(),
            "target_proportions": frame.label.value_counts(normalize=True).sort_index().to_dict(),
            "attack_category_counts": frame.attack_cat.value_counts().sort_index().to_dict(),
            "missing_by_column": frame.isna().sum().to_dict(),
            "non_finite_numeric": non_finite_counts(frame).to_dict(orient="index"),
            "categorical_cardinality": frame[categorical].nunique().to_dict(),
            "numeric_summary": finite.describe(
                percentiles=[.01, .25, .5, .75, .99]
            ).to_dict(),
        }
    # Ranking only training relationships avoids using held-out labels for selection.
    train = frames["training"]
    relationships = train[numeric].replace([np.inf, -np.inf], np.nan).corrwith(
        train.label, method="spearman"
    ).dropna()
    ranked = sorted(relationships.index, key=lambda col: (-abs(relationships[col]), col))
    report["training_spearman_with_label"] = relationships[ranked].to_dict()
    output = ROOT / "reports"
    figures = output / "figures"
    figures.mkdir(parents=True, exist_ok=True)
    # JSON null represents undefined statistics, never non-standard NaN literals.
    clean = json.loads(pd.Series(report).to_json(double_precision=15))
    (output / "eda_summary.json").write_text(
        json.dumps(clean, indent=2, allow_nan=False) + "\n", encoding="utf-8"
    )
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10})
    for key, filename, title in [
        ("target_counts", "binary_distribution.png", "Network flows: normal vs attack"),
        ("attack_category_counts", "attack_category_distribution.png", "Network flows by attack category"),
    ]:
        table = pd.DataFrame({name: values[key] for name, values in report["splits"].items()})
        if key == "target_counts":
            table.index = ["Normal (0)", "Attack (1)"]
        ax = table.plot.barh(figsize=(9, 5))
        ax.set(title=title, xlabel="Flow count", ylabel="")
        ax.figure.tight_layout()
        ax.figure.savefig(figures / filename, dpi=150)
        plt.close(ax.figure)
    ax = relationships[ranked[:10]].iloc[::-1].plot.barh(figsize=(9, 5), color="#287a99")
    ax.axvline(0, color="black", linewidth=.7)
    ax.set(xlim=(-1, 1), xlabel="Spearman correlation with label (attack = 1)",
           title="Strongest numeric associations — training split only", ylabel="")
    ax.figure.tight_layout()
    ax.figure.savefig(figures / "numeric_label_relationships.png", dpi=150)
    plt.close(ax.figure)
    print(json.dumps({"splits": {name: {key: value[key] for key in (
        "shape", "target_counts", "attack_category_counts", "categorical_cardinality"
    )} for name, value in report["splits"].items()},
        "top_training_relationships": report["training_spearman_with_label"],
        "report": str(output / "eda_summary.json"), "figures": str(figures)}, indent=2))


if __name__ == "__main__":
    main()
