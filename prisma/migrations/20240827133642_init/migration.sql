-- CreateTable
CREATE TABLE "Measure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "datetime" DATETIME NOT NULL,
    "measure_value" REAL NOT NULL,
    "confirmed_value" REAL,
    "customerId" TEXT NOT NULL
);
