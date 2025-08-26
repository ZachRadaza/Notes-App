import { NotesButton } from "../notes-button/notes-button.js";
import { NotesDialog } from "../notes-dialog/notes-dialog.js";
import "../notes-dialog/notes-dialog.js";
import "../notes-button/notes-button.js";

export class NotesGroup extends HTMLElement{

    public shadow = this.attachShadow({ mode: "open" });

    private notesButtonList!: NotesButton[];
    private notesButtonListFiltered!: NotesButton[]; 
    private lastSort!: boolean[];
    private filtered!: boolean; //if we are using the filtered list or no
    private initialized = false;

    private div!: HTMLDivElement;

    async connectedCallback(){
        if(this.initialized) return;
        this.initialized = true;

        const [html, css] = await Promise.all([
            fetch(new URL("./notes-group.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./notes-group.css", import.meta.url)).then(r => r.text())
        ]);
        this.shadow.innerHTML = `
            <link rel="stylesheet" href="/styles/globals.css">
            <style>${css}</style>
            ${html}`;

        this.initializeHTMLElements();
        this.initializeFields();

        //wire button
        this.shadow.getElementById("arrow")!.addEventListener("click", () => this.hideNotes());
        this.shadow.getElementById("add")!.addEventListener("click", () => this.openDialog());
        this.shadow.getElementById("filter")!.addEventListener("click", () => this.filterImportant());
        this.shadow.getElementById("sort")!.addEventListener("click", () => this.sortAlphabetically());

        this.addFakeNotes();
        
        this.update();
    }

    private initializeFields(){
        this.notesButtonList = [];
        this.notesButtonListFiltered = [];
        this.lastSort = [true, false, false]; //alphabetically, date updated, date created
        this.filtered = false;
    }

    private initializeHTMLElements(){
        const div = this.shadow.querySelector<HTMLDivElement>("#list-notes");

        if (!div) {
            throw new Error("Missing #list-notes in notes-group.html");
        }

        this.div = div;
    }

    private addFakeNotes():void {
        const btns = [document.createElement("notes-button") as NotesButton, document.createElement("notes-button") as NotesButton, document.createElement("notes-button") as NotesButton];
        const titles: string[] = ["Why I am a Software Engineer", "Applications I want to develop", "Things to buy for girlfriend"];
        const descs: string[] = ["reasons why I chose to be a SWE", "sites of apps I want to make someday", "cheap stuff I'm broke"];
        const imp: boolean[] = [true, false, false];

        let i: number = 0;
        btns.forEach(btn => {
            btn.setTitleNotes = titles[i]!;
            btn.setDescription = descs[i]!;
            btn.setImportant = imp[i]!;
            btn.setNotesGroup = this;
            btn.setNotes = descs[i]!;

            this.notesButtonList.push(btn);
            i++
        });

    }

    public addNotesButton(nb: NotesButton): void{
        this.notesButtonList.push(nb);
        this.update();
    }

    public removeNotesButton(nb: NotesButton): void{
        this.notesButtonList = this.notesButtonList.filter(button => button !== nb);
        this.update();
    }

    private update(){
        this.sortByLast();

        this.div.replaceChildren();

        const temp = !this.filtered ? this.notesButtonList : this.notesButtonListFiltered;
        let i = 0;
        temp.forEach(button => {
            i === 0 ? button.firstList = true : button.firstList = false;
            i === temp.length - 1 ? button.lastList = true : button.lastList = false;
            this.div.appendChild(button);
            i++;
        });

    }

    //sorts
    private sortByLast(): void{
        const type = this.lastSort.indexOf(true)
        switch(type){
            case 0:
                this.sortAlphabetically();
                break;
            case 1:
                this.sortByUpdate();
                break;
            case 2:
                this.sortByDate();
                break;
            default:
                break;
        }
    }

    private sortAlphabetically(): void{
        if(this.notesButtonList.length <= 1) return;

        this.notesButtonList.sort((a, b) =>
            (a.getTitleNotes ?? "").localeCompare(b.getTitleNotes ?? "", "en", { sensitivity: "base" })
        );

        this.lastSort.fill(false);
        this.lastSort[0] = true;
    }

    //sorts by last update
    private sortByUpdate(): void{
        if(this.notesButtonList.length <= 1) return;

        this.lastSort.fill(false);
        this.lastSort[1] = true;
    }

    //sorts by creation date
    private sortByDate(): void{
        if(this.notesButtonList.length <= 1) return;

        this.lastSort.fill(false);
        this.lastSort[2] = true;
    }

    //filters
    public filterImportant(){
        this.notesButtonListFiltered = this.notesButtonList.filter(b => b.getImportant);
        this.filtered = true;
        this.update();
    }

    //arrow button
    public hideNotes(){
        this.div.replaceChildren();
    }

    //add button
    public openDialog(){
        const dlg = document.createElement("dialog", { is: "notes-dialog" }) as HTMLDialogElement & NotesDialog;
        (dlg as any).notesGroup = this;        // use the setter via assignment
        this.shadow.appendChild(dlg);          // append so it’s in the DOM
        dlg.showModal();                       // open it
    }


}

customElements.define("notes-group", NotesGroup);