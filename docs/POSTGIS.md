# Optional PostGIS upgrade

The MVP deliberately stores `lat` and `lng` as indexed floats. This keeps Prisma migrations portable and makes the project work on every managed PostgreSQL plan. When the data set grows, enable PostGIS and add a generated geography column:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE "Vendor" ADD COLUMN location geography(Point, 4326);
UPDATE "Vendor" SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
CREATE INDEX vendor_location_gist ON "Vendor" USING GIST (location);
```

Keep `lat` and `lng` during the transition, or update them with a database trigger.

## Vendors within 2 km

```sql
SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance_m
FROM "Vendor"
WHERE status = 'ACTIVE'
  AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, 2000)
ORDER BY distance_m;
```

`$1` is latitude and `$2` is longitude. Use `prisma.$queryRaw` with tagged-template parameters; never interpolate coordinates into SQL.

## Open now

The MVP evaluates the JSON operating-hours object in application code so overnight hours and Dhaka time are handled consistently. A SQL expression for today's simple, non-overnight schedules is:

```sql
SELECT * FROM "Vendor"
WHERE status = 'ACTIVE'
  AND ("operatingHours" -> lower(to_char(timezone('Asia/Dhaka', now()), 'Dy')) ->> 'closed')::boolean = false
  AND localtime BETWEEN
    ("operatingHours" -> lower(to_char(timezone('Asia/Dhaka', now()), 'Dy')) ->> 'open')::time
    AND ("operatingHours" -> lower(to_char(timezone('Asia/Dhaka', now()), 'Dy')) ->> 'close')::time;
```

## Top rated in an area

```sql
SELECT * FROM "Vendor"
WHERE status = 'ACTIVE' AND area = $1 AND "ratingCount" >= 1
ORDER BY "ratingAvg" DESC, "ratingCount" DESC
LIMIT 20;
```
