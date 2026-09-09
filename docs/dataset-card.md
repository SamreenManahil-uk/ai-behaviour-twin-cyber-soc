# UNSW-NB15 dataset card

## Identity and official provenance

[UNSW-NB15 official source](https://research.unsw.edu.au/projects/unsw-nb15-dataset).
Creators: Nour Moustafa and Jill Slay, UNSW Canberra at ADFA,
Australian Centre for Cyber Security (ACCS), Cyber Range Lab.
The 2015 benchmark combines normal network activity with synthetic attacks,
generated using IXIA PerfectStorm and converted to flow features using Argus,
Bro-IDS and additional algorithms. It represents labelled network connections.

**This is network-flow data, not the project's simulated endpoint Behaviour
Twin telemetry.** It does not supply endpoint process, user or host behaviour
histories. Future benchmark results must be reported separately from simulated
endpoint demonstrations; they cannot validate endpoint detection performance.

## Acquisition and integrity

The official page links to [UNSW SharePoint](https://unsw-my.sharepoint.com/:f:/g/personal/z5025758_ad_unsw_edu_au/EnuQZZn3XuNBjgfcUu4DIVMBLCHyoLHqOswirpOQifr1ag?e=gKWkLS).
Following that link non-interactively returned HTTP 403. Consequently, the files
were downloaded from the public research repository Figshare on 2026-09-09:
[linsen liu (2026), unsw-nb15, version 1](https://doi.org/10.6084/m9.figshare.31804039.v1).
[Deposit metadata and checksums](https://api.figshare.com/v2/articles/31804039/versions/1).
This is a secondary deposit, not an official UNSW-hosted download. Its depositor
is not being credited as the original dataset creator. The deposit identifies
the two files as UNSW-NB15 data for network intrusion detection research.

| Local file under `ml-service/data/raw/` | Figshare filename | Exact download | Bytes |
| --- | --- | --- | ---: |
| `UNSW_NB15_training-set.csv` | `UNSW_NB15_train-set.csv` | https://ndownloader.figshare.com/files/62923120 | 32,293,018 |
| `UNSW_NB15_testing-set.csv` | `UNSW_NB15_test-set.csv` | https://ndownloader.figshare.com/files/62923117 | 15,380,800 |

Only local filenames differ; downloaded bytes were not edited. Both local MD5
digests match the corresponding Figshare `computed_md5` and `supplied_md5`:

| Split | Verified MD5 | Locally calculated SHA-256 |
| --- | --- | --- |
| Training | `e55caabaa6cd4a8f1c06a227bcfababc` | `bec7dd5ec88dc2a0ccc7a07879d338395ed7421750f675fd0339e07dfe0648fa` |
| Testing | `e0beea40262e46168cdb81476dbc27b4` | `734fe6642edf758f7c94d7d9149426b49d202fe8e7bf0bef47392489c3c0a559` |

These verify the secondary downloads, not byte-for-byte identity with the
inaccessible official files. Observed split sizes match UNSW's published sizes.
No alternative dataset, resampling or generated records were used.

## Observed contents

Measured with `ml-service/.venv/bin/python ml-service/scripts/inspect_dataset.py`:

| Split | Rows (excluding header) | Columns | label=0 (normal) | label=1 (attack) |
| --- | ---: | ---: | ---: | ---: |
| Training | 175,341 | 45 | 56,000 | 119,341 |
| Testing | 82,332 | 45 | 37,000 | 45,332 |

Targets are `label` (binary) and `attack_cat` (category). The observed 45 columns
comprise `id`, 42 other non-target columns and the two targets. Do not feed
either target into predictors, or treat `id` as a meaningful traffic feature.

The nine attack categories and the normal class have these exact counts:

| attack_cat | Training | Testing |
| --- | ---: | ---: |
| Analysis | 2,000 | 677 |
| Backdoor | 1,746 | 583 |
| DoS | 12,264 | 4,089 |
| Exploits | 33,393 | 11,132 |
| Fuzzers | 18,184 | 6,062 |
| Generic | 40,000 | 18,871 |
| Normal | 56,000 | 37,000 |
| Reconnaissance | 10,491 | 3,496 |
| Shellcode | 1,133 | 378 |
| Worms | 130 | 44 |

UNSW calls the backdoor category “Backdoors”; the CSV value is `Backdoor`.
Ordered column names and inferred dtypes match across splits. Both have zero
empty-cell missing values in every column and zero duplicate full rows
(including `id`). This does not establish uniqueness when identifiers are
excluded, nor absence of train/test overlap; those checks remain future work.
Literal markers such as `-` are preserved and are not counted as empty cells.

Both files include a UTF-8 byte-order mark, handled by `utf-8-sig` decoding.
The script strips only leading/trailing column-name whitespace; it does not
trim cell values, impute, encode, drop rows, rewrite files or train models.
It prints every column, dtype, missing-value count and target distribution,
and fails for malformed rows, missing targets, unexpected split sizes,
invalid binary labels or schema mismatches.

## Use conditions and citations

The official source grants ongoing free academic research use, requires author
agreement for commercial use and asserts Moustafa and Slay's copyright. It asks
users to cite its five listed papers. Figshare labels its secondary deposit
CC BY 4.0; that depositor-supplied label is not evidence that the original
authors' conditions have been superseded. Retain both provenance statements.

The official page lists these citations (full publication links are there):

1. Moustafa and Slay (2015), *UNSW-NB15: a comprehensive data set for network intrusion detection systems (UNSW-NB15 network data set)*, MilCIS.
2. Moustafa and Slay (2016), statistical evaluation of UNSW-NB15 and comparison with KDD99, *Information Security Journal*.
3. Moustafa et al. (2017), geometric area analysis for anomaly detection using trapezoidal area estimation, *IEEE Transactions on Big Data*.
4. Moustafa et al. (2017), intrusion-detection statistical decision-making with finite Dirichlet mixture models, *Data Analytics and Decision Support for Cybersecurity*.
5. Sarhan, Layeghy, Moustafa and Portmann, *NetFlow Datasets for Machine Learning-Based Network Intrusion Detection Systems*, BDTA/WiCON 2020 proceedings.

Also acknowledge the exact Figshare deposit above when describing acquisition.

## Limitations and repository handling

- A 2015 laboratory benchmark cannot establish performance on current production
  traffic, unseen attacks or this project's simulated endpoint domain.
- Classes are imbalanced, especially Worms; future evaluation needs per-class
  metrics and must keep test data out of preprocessing and model selection.
- The official full dataset description differs from these selected split
  files; the observed schema here has 45 columns. Do not assume all features
  from the full release are present.
- Matching sizes and secondary checksums support reproducibility but are not
  an independent audit of labels or official byte identity.
- No model has been trained and no detection-performance claim is made.

Existing `.gitignore` rules `/ml-service/data/**` and `*.csv` exclude the raw
downloads. Keep `ml-service/data/raw/.gitkeep`: ignored CSVs do not replace a
tracked placeholder. Dependencies and their versions were not changed.
