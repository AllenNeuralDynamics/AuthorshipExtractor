# figures/

Scripts for generating figure data used by the paper.  
These are **data-generation tools**, separate from the website UI in `src/`.

## Workflow

1. Run a script here to fetch / compute data
2. Script writes output to `public/figures/*.yaml`
3. The website loads those YAML files at runtime

## Scripts

| Script | Output | Description |
|--------|--------|-------------|
| `fetch_author_count_growth.py` | `public/figures/author-count-growth.yaml` | Queries OpenAlex API for mean authors per paper in biomedical sciences, 2003–2025 |

## Requirements

```
pip install requests pyyaml
```

## Running

```bash
cd figures
python3 fetch_author_count_growth.py
```

Data is written to `../public/figures/` and committed to the repo so the
website works without re-running the scripts.
