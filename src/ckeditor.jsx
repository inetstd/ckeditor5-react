/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from "react";
import PropTypes from "prop-types";

import BlockToolbar from "@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar";

import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import HeadingButtonsUI from "@ckeditor/ckeditor5-heading/src/headingbuttonsui";
import ParagraphButtonUI from "@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui";
import SIWidget from "./SIWidget";
import Image from "@ckeditor/ckeditor5-image/src/image";

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export default class CKEditor extends React.Component {
	constructor(props) {
		super(props);

		// After mounting the editor, the variable will contain a reference to the created editor.
		// @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
		this.editor = null;
		this.domContainer = React.createRef();
	}

	// This component should never be updated by React itself.
	shouldComponentUpdate(nextProps) {
		if (!this.editor) {
			return false;
		}

		if (this._shouldUpdateContent(nextProps)) {
			this.editor.setData(nextProps.data);
		}

		if ("disabled" in nextProps) {
			this.editor.isReadOnly = nextProps.disabled;
		}

		return false;
	}

	// Initialize the editor when the component is mounted.
	componentDidMount() {
		this._initializeEditor();
	}

	// Destroy the editor before unmouting the component.
	componentWillUnmount() {
		this._destroyEditor();
	}

	// Render a <div> element which will be replaced by CKEditor.
	render() {
		// We need to inject initial data to the container where the editable will be enabled. Using `editor.setData()`
		// is a bad practice because it initializes the data after every new connection (in case of collaboration usage).
		// It leads to reset the entire content. See: #68

		return <div ref={this.domContainer} dangerouslySetInnerHTML={{ __html: this.props.data || "" }} />;
	}

	_initializeEditor() {
		this.props.editor
			.create(this.domContainer.current, this.props.config)
			.then(editor => {
				this.editor = editor;

				if ("disabled" in this.props) {
					editor.isReadOnly = this.props.disabled;
				}

				if (this.props.onInit) {
					this.props.onInit(editor);
				}

				const modelDocument = editor.model.document;
				const viewDocument = editor.editing.view.document;

				modelDocument.on("change:data", event => {
					/* istanbul ignore else */
					if (this.props.onChange) {
						this.props.onChange(event, editor);
					}
				});

				this.editor.onWidgetInsertRequested = this.onWidgetInsertRequested;

				viewDocument.on("focus", event => {
					/* istanbul ignore else */
					if (this.props.onFocus) {
						this.props.onFocus(event, editor);
					}
				});

				viewDocument.on("blur", event => {
					/* istanbul ignore else */
					if (this.props.onBlur) {
						this.props.onBlur(event, editor);
					}
				});
			})
			.catch(error => {
				console.error(error);
			});
	}

	_destroyEditor() {
		if (this.editor) {
			this.editor.destroy().then(() => {
				this.editor = null;
			});
		}
	}

	_shouldUpdateContent(nextProps) {
		// Check whether `nextProps.data` is equal to `this.props.data` is required if somebody defined the `#data`
		// property as a static string and updated a state of component when the editor's content has been changed.
		// If we avoid checking those properties, the editor's content will back to the initial value because
		// the state has been changed and React will call this method.
		if (this.props.data === nextProps.data) {
			return false;
		}

		// We should not change data if the editor's content is equal to the `#data` property.
		if (this.editor.getData() === nextProps.data) {
			return false;
		}

		return true;
	}

	onWidgetInsertRequested(editor) {
		if (this.props.onWidgetInsertRequested) this.props.onWidgetInsertRequested(editor);
		// editor.model.change(writer => {
		// 	const root = editor.model.document.getRoot();

		// 	const element =
		// 		editor.model.document.selection &&
		// 		editor.model.document.selection.getFirstPosition() &&
		// 		editor.model.document.selection.getFirstPosition().parent;

		// 	const paragraph = writer.createElement("paragraph");
		// 	writer.insertText("foo", paragraph);
		// 	const t = writer.createElement("my-tag", { "widget-id": "to" });
		// 	writer.insert(t, paragraph);

		// 	writer.insert(paragraph, element || root.getChild(root.childCount - 1), "after");
		// });
	}
}

// Properties definition.
CKEditor.propTypes = {
	editor: PropTypes.func.isRequired,
	data: PropTypes.string,
	config: PropTypes.object,
	onChange: PropTypes.func,
	onInit: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	onWidgetInsertRequested: PropTypes.func,
	disabled: PropTypes.bool
};

// Default values for non-required properties.
CKEditor.defaultProps = {
	config: {
		// plugins: [WidgetPlugin, BlockToolbar, Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI, Bold, Italic, Essentials],
		plugins: [SIWidget, BlockToolbar, Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI, Bold, Italic, Essentials, Image],
		blockToolbar: ["paragraph", "heading1", "heading2", "heading3"],
		heading: {
			options: [
				{ model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
				{ model: "heading1", view: "h2", title: "Heading 1", class: "ck-heading_heading1" },
				{ model: "heading2", view: "h3", title: "Heading 2", class: "ck-heading_heading2" },
				{ model: "heading3", view: "h4", title: "Heading 3", class: "ck-heading_heading3" }
			]
		},
		toolbar: ["bold", "italic", "undo", "redo", "si-widget"]
	}
};
