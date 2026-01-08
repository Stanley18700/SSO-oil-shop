-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('SINGLE_OIL', 'MIX');

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "total_quantity" DECIMAL(10,3) NOT NULL,
    "sale_type" "SaleType" NOT NULL,
    "note" VARCHAR(255),

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "oil_id" INTEGER NOT NULL,
    "oil_name_snapshot" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "line_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_oil_id_fkey" FOREIGN KEY ("oil_id") REFERENCES "oils"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
