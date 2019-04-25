import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";

import imageIcon from "@ckeditor/ckeditor5-core/theme/icons/image.svg";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";

export default class SIWidget extends Plugin {
	init() {
		const editor = this.editor;
		const tag = "my-tag";
		const attrKeys = ["widget-id", "title"];

		editor.model.schema.register(tag, {
			allowIn: "$root",
			allowAttributes: ["widget-id", "title"],
			isObject: true,
			isBlock: true
		});

		editor.model.schema.extend("$text", {
			allowIn: tag
		});

		editor.conversion.for("editingDowncast").elementToElement({
			model: tag,
			view: (modelItem, viewWriter) => {
				const widgetElement = viewWriter.createContainerElement(tag);

				return toWidget(widgetElement, viewWriter);
			}
		});
		editor.conversion.for("dataDowncast").elementToElement({
			model: tag,
			view: tag
		});
		editor.conversion.for("upcast").elementToElement({
			view: tag,
			model: tag
		});
		attrKeys.forEach(atr => {
			editor.conversion.for("downcast").attributeToAttribute({
				model: atr,
				view: atr,
				converterPriority: "low"
			});
		});

		editor.ui.componentFactory.add("si-widget", locale => {
			const view = new ButtonView(locale);

			view.set({
				label: "Insert Widget",
				icon: imageIcon,
				tooltip: true
			});

			view.on("execute", () => {
				// const widgetId = prompt("Widget id");
				editor.onWidgetInsertRequested(editor);
			});

			return view;
		});
	}
}
