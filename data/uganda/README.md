# Uganda source data

`source/electoral-commission-2022.json` is the pinned baseline used by the web data builder. It originated from the Electoral Commission-derived `ug-locations` dataset and contains district, constituency, sub-county, parish, and village relationships.

Treat this directory as governed input:

- do not edit generated names manually;
- record source and effective date when replacing the baseline;
- validate counts and hierarchy relationships before release;
- preserve the original source licence and attribution; and
- never mix electoral groupings with administrative parents without an explicit schema.
