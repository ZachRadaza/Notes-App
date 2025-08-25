import { NotesButton } from "../notes-button/notes-button.js";
import type { NotesGroup } from "../notes-group/notes-group.js";
import "../notes-button/notes-button.js";

export class NotesDialog extends HTMLDialogElement{

    //fields
    private _title?: string;
    private _description?: string;
    private _important?:boolean;
    private group!: NotesGroup
    private _initialized: boolean = false;

    private inputTitle!: HTMLInputElement;
    private inputDescription!: HTMLInputElement;
    private inputImportant!: HTMLInputElement;

    async connectedCallback(){
        if(this._initialized) return;
        this._initialized = true;

        const [html, css] = await Promise.all([
            fetch(new URL("./notes-dialog.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./notes-dialog.css", import.meta.url)).then(r => r.text())
        ]);
        this.innerHTML = `<style>${css}</style>${html}`;

        this.initializeHTMLElements();

        this.querySelector<HTMLButtonElement>("#close")?.addEventListener("click", () => this.close());
        this.querySelector<HTMLButtonElement>("#create")?.addEventListener("click", () => this.submit());
    }

    private initializeHTMLElements(){
        const inputT = this.querySelector<HTMLInputElement>("#title");
        const inputD = this.querySelector<HTMLInputElement>("#description");
        const inputI = this.querySelector<HTMLInputElement>("#important");

        if (!inputD || !inputT || !inputI) {
            throw new Error("Missing #title, #important or #description in notes-dialog.html");
        }

        this.inputTitle = inputT;
        this.inputDescription = inputD;
        this.inputImportant = inputI;
    }

    //getters
    public get titleInput(){
        return this._title;
    }

    public get description(){
        return this._description;
    }

    public get important(){
        return this._important;
    }

    //setters
    public set notesGroup(g: NotesGroup){
        this.group = g;
    }

    //methods
    public submit(): void{
        this._title = this.inputTitle.value;
        this._description = this.inputDescription.value;
        this._important = this.inputImportant.checked;

        const btn = document.createElement("notes-button") as NotesButton;
        // NotesButton exposes setters/properties:
        (btn as any).setTitleNotes = this._title ?? "";
        (btn as any).setDescription = this._description ?? "";
        (btn as any).setImportant = !!this._important;
        (btn as any).setNotesGroup = this.group;

        this.group.addNotesButton(btn);
        this.close();
        this.remove();
    }


}
customElements.define("notes-dialog", NotesDialog, { extends: "dialog" });