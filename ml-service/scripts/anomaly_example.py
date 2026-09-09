"""Score one official test event with the trusted saved anomaly bundle."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from cyber_soc_ml.anomaly import load_bundle, predict
from cyber_soc_ml.data import RAW_DIR, read_csv, split_features


def main():
    split = split_features(read_csv(RAW_DIR / "UNSW_NB15_testing-set.csv"))
    print(json.dumps({"true_label_for_evaluation_only": int(split.y.iloc[0])}))
    print(json.dumps(predict(split.X.iloc[0].to_dict(), load_bundle()),
                     indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
