-- AlterTable
ALTER TABLE "Region" ADD COLUMN "blurb" TEXT;

-- One-time transition: move former seed blurbs onto existing region rows (no-op if slug absent).
UPDATE "Region" SET "blurb" = 'Glacial valleys, high passes and the great Karakoram.' WHERE "slug" = 'gilgit-baltistan';
UPDATE "Region" SET "blurb" = 'Forest valleys, alpine lakes and welcoming mountain towns.' WHERE "slug" = 'kpk-northern-areas';
UPDATE "Region" SET "blurb" = 'River valleys, green ridgelines and remote lake country.' WHERE "slug" = 'azad-jammu-kashmir';
