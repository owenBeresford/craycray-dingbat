import { Module } from "@nestjs/common";
import { ShoppingBE } from "./ShoppingBE";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ShoppingService } from "./ShoppingService";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Module({
  imports: [  ],
  controllers: [ShoppingBE],
  providers: [ShoppingService],
})
// NOTE cannot add docs on that *Decorator*, or add semis
export class ShoppingModule {}
