import type { NotesGroup } from "../notes-group/notes-group.js";
import { NotesDialog } from "../notes-dialog/notes-dialog.js";
import "../notes-dialog/notes-dialog.js";

export class NotesButton extends HTMLElement{
    //fields
    //for the DOM
    private shadow = this.attachShadow({ mode: "open" });
    private group!: NotesGroup;
    private titleNotes: string = 'notes';
    private description: string = "";
    private notes: string = "";
    private important: boolean = false;
    private dateMade!: Date;
    private dateUpdated!: Date;
    

    private initialized: boolean = false;

    private titleH1!: HTMLHeadingElement;
    private descH4!: HTMLHeadingElement;
    private impSpan!: HTMLSpanElement;
    private cont!: HTMLDivElement;
    private first: boolean = false;
    private last: boolean = false;

    //runs when added
    async connectedCallback(){
        if(this.initialized) return;
        this.initialized = true;

        //load html and css
        const [html, css] = await Promise.all([
            fetch(new URL("./notes-button.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./notes-button.css", import.meta.url)).then(r => r.text())
        ]);

        //connects css
        this.shadow.innerHTML = 
            `<link rel="stylesheet" href="/styles/globals.css">
            <style>${css}</style>
            ${html}`;

        this.initializeHTMLElements();

        this.dateMade = new Date();
        this.dateUpdated = new Date();

        this.shadow.getElementById("delete")!.addEventListener("click", () => this.delete());
        this.addEventListener("click", () => {
            this.openDialog();
        });


        this.update();
    }
    
    //connects variables to html
    initializeHTMLElements(): void{
        const titleH1 = this.shadow.querySelector<HTMLHeadingElement>("#title-notes");
        const descH4 = this.shadow.querySelector<HTMLHeadingElement>("#description");
        const impSpan = this.shadow.querySelector<HTMLSpanElement>("#important-icon");
        const cont = this.shadow.querySelector<HTMLDivElement>("#container-button");

        if (!titleH1 || !descH4 || !impSpan || !cont) {
            throw new Error("Missing #title-notes, #important-icon, #container-button, or #description in notes-button.html");
        }

        this.titleH1 = titleH1;
        this.descH4 = descH4;
        this.impSpan = impSpan;
        this.cont = cont;
    }

    //getters
    public get getTitleNotes(){
        return this.titleNotes;
    }

    public get getDescription(){
        return this.description;
    }

    public get getNotes(){
        return this.notes;
    }

    public get getImportant(){
        return this.important;
    }

    public getDateMade(){
        return this.dateMade;
    }

    public getDateUpdated(){
        return this.dateUpdated;
    }

    //setters
    public set setTitleNotes(t: string){
        this.titleNotes = t;
        this.update();
    }

    public set setDescription(d: string){
        this.description = d;
        this.update();
    }

    public set setNotes(n: string){
        this.notes = n;
    }

    public set setImportant(i: boolean){
        this.important = i;
        this.update();
    }

    public set setNotesGroup(g: NotesGroup){
        this.group = g;
        this.update();
    }

    public set setDateUpdated(d: Date){
        this.dateUpdated = d;
        this.update();
    }

    public set firstList(b: boolean){
        this.first = b;
        this.update();
    }
    
    public set lastList(b: boolean){
        this.last = b;
        this.update();
    }

    //methods
    private update(){
        if (!this.initialized) return;
        this.titleH1.textContent = this.titleNotes;
        this.descH4.textContent = this.description;
        this.impSpan.textContent = this.important ? "!" : "";

        this.cont.classList.remove("first-button");
        this.cont.classList.remove("last-button");
        if(this.first)  this.cont.classList.add("first-button");
        if(this.last)  this.cont.classList.add("last-button");
    }
    
    public delete(){
        this.group.removeNotesButton(this);
    }

    private openDialog(){
        const dlg = document.createElement("dialog", { is: "notes-dialog" }) as HTMLDialogElement & NotesDialog;
        this.group.shadow.appendChild(dlg);
        (dlg as any).notesGroup = this.group;
        (dlg as any).notesButton = this;
        (dlg as any).newDialog = false;
        dlg.showModal();
        (dlg as any).titleInput = this.titleNotes;
        (dlg as any).notes = this.notes;
        (dlg as any).important = this.important;
    }
}

customElements.define("notes-button", NotesButton);