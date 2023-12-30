import { Command } from "$cliffy/command/mod.ts";
import { deleteTemplate, getTemplate } from "../../db/templates.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("It deletes a template.")
  .action(async (_, id) => {
    const { value: template } = await getTemplate(id);

    if (!template) {
      console.log(`No template with id ${id} found.`);
      return;
    }

    await deleteTemplate(template.id);

    console.log(`Template "${template.name}" (${id}) deleted.`);
  });
