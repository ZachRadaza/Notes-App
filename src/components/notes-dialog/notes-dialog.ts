import { NotesButton } from "../notes-button/notes-button.js";
import type { NotesGroup } from "../notes-group/notes-group.js";
import "../notes-button/notes-button.js";

export class NotesDialog extends HTMLDialogElement{

    //fields
    private _title: string = "";
    private _notes: string = "";
    private _important:boolean = false;
    private group!: NotesGroup;
    private button!: NotesButton;
    private _initialized: boolean = false;
    private _newDialog: boolean = true;

    private inputTitle!: HTMLInputElement;
    private textArea!: HTMLTextAreaElement;
    private inputImportant!: HTMLInputElement;

    async connectedCallback(){
        if(this._initialized) return;
        this._initialized = true;

        const [html, css] = await Promise.all([
            fetch(new URL("./notes-dialog.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./notes-dialog.css", import.meta.url)).then(r => r.text())
        ]);
        this.innerHTML = 
            `<link rel="stylesheet" href="/styles/globals.css">
            <style>${css}</style>
            ${html}`;

        this.initializeHTMLElements();

        this.querySelector<HTMLButtonElement>("#close")?.addEventListener("click", () => { this.close(); this.group.shadow.removeChild(this)});
        this.querySelector<HTMLButtonElement>("#submit")?.addEventListener("click", () => this.submit());

        this.update();
    }

    private initializeHTMLElements(){
        const inputT = this.querySelector<HTMLInputElement>("#title");
        const inputTE = this.querySelector<HTMLTextAreaElement>("#notes");
        const inputI = this.querySelector<HTMLInputElement>("#important");

        if (!inputTE || !inputT || !inputI) {
            throw new Error("Missing #title, #important or #notes in notes-dialog.html");
        }

        this.inputTitle = inputT;
        this.textArea = inputTE;
        this.inputImportant = inputI;
    }

    //getters
    public get title(){
        return this._title;
    }

    public get notes(){
        return this._notes;
    }

    public get important(){
        return this._important;
    }

    //setters
    public set titleInput(t: string){
        this._title = t;
        this.update();
    }

    public set notes(t: string){
        this._notes = t;
        this.update();
    }

    public set important(b: boolean){
        this._important = b;
        this.update();
    }

    public set notesGroup(g: NotesGroup){
        this.group = g;
        //this.update();
    }

    public set notesButton(b: NotesButton){
        this.button = b;
        //this.update();
    }

    public set newDialog(d: boolean){
        this._newDialog = d;
    }
    //methods
    private update(): void{
        if (!this._initialized) return;  
        this.inputTitle.value = this._title || "";
        this.textArea.value = this._notes || "";
        this.inputImportant.checked = this._important! || false;
    }

    public submit(): void{
        this._title = this.inputTitle.value;
        this._notes = this.textArea.value;
        this._important = this.inputImportant.checked;
        const truncated = this._notes && this._notes.length > 50
            ? this._notes.substring(0, 50) + "..."
            : this._notes ?? ""; // fallback to empty string if undefined

        this._newDialog ? this.create(truncated) : this.save(truncated);
        console.log(1);
        this.close();
        this.remove();
    }

    private create(truncated: string): void{
        const btn = document.createElement("notes-button") as NotesButton;
    
        (btn as any).setTitleNotes = this._title ?? "";
        (btn as any).setDescription = truncated;
        (btn as any).setImportant = !!this._important;
        (btn as any).setNotesGroup = this.group;
        (btn as any).notesDialog = this;
        this.button = btn;

        this.group.addNotesButton(btn);

        this._newDialog = false;
    }

    private save(truncated: string): void {
        this.button.setTitleNotes = this._title ?? "";
        this.button.setDescription = truncated;
        this.button.setImportant = !!this._important;
        this.button.setNotesGroup = this.group;
        this.button.setDateUpdated = new Date();
    }
    

}
customElements.define("notes-dialog", NotesDialog, { extends: "dialog" });