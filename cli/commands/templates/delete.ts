import { Command } from "@cliffy/command";
import { colors } from "@cliffy/ansi/colors";
import { getDatabaseConnection } from "../../db.ts";
import { deleteTemplate, getTemplate } from "../../db/templates.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("Deletes a template.")
  .action(async (_, id) => {
    const kv = await getDatabaseConnection();

    const { value: template } = await getTemplate(kv, id);

    if (!template) {
      console.log(colors.red(`No template with id ${id} found.`));

      Deno.exit(1);
    }

    await deleteTemplate(kv, template.id);

    console.log(colors.green(`Template "${template.name}" (${id}) deleted.`));
  });
