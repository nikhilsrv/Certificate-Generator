const Try = document.getElementById("try");
const files_in=document.getElementById("file_in");
const loader = document.getElementsByClassName("loader")[0];
const upload=document.getElementById("upload");
const size = document.getElementById("size");
const { PDFDocument, rgb, degrees } = PDFLib;
const { Fontkit } = fontkit
const x=document.getElementById("x");
const y=document.getElementById("y");
const output=document.getElementById("output");
const generate=document.getElementById("generate");
const namesInput = document.getElementById('names');
const check=document.getElementById("check");
const view=document.getElementById("view");
const main_component=document.getElementById("main_component");
const cross=document.getElementById("cross");
const disclaimer=document.getElementById("disclaimer")
var use_url=""

let width=screen.width;
console.log(screen.height);
Try.addEventListener("click", () => {
    if(width>=700)
    window.scrollTo(0, 700);
    else
    window.scrollTo(0,200);
})

cross.addEventListener("click",()=>{
    disclaimer.style.display="none";
    main_component.style.display="block";
})

// Upload file section starts
const uploadFile=async()=> {
    if(files_in.files.length===0)
    {
    alert("No file has been choosen")
    return
    }
    if(width<=700)
    {
        window.scrollTo(0,550)
        view.style.height="40rem"
        view.style.width="40rem";
    }
    else
    {
    view.style.height="30rem"
    view.style.width="30rem";
    }
    
    view.style.position="absolute";
    loader.style.display = "block";

    const Data = files_in.files[0];
    const formData = new FormData();
    formData.append('file', Data);
    try {
        const response = await fetch('/', {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error uploading file');
        }

        const result = await response.json();
        //console.log(result);
        use_url = result.fileUrl
        generatePDF();
    } catch (error) {
        console.error(error.message);
    }
}
upload.addEventListener("click", uploadFile);
// upload file section ends

// PDF View section starts
const generatePDF = async () => {
   // console.log(use_url)
    if(use_url.length===0)
    {
        alert("First Upload a certificate");
        return 
    }
    const existingPdfBytes = await fetch(use_url).then((res) => {
        return res.arrayBuffer()
    });
    //console.log(existingPdfBytes)

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    pdfDoc.registerFontkit(fontkit);

    const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer())


    SanChezFont = await pdfDoc.embedFont(fontBytes);
    const pages = pdfDoc.getPages();
   

    const firstPage = pages[0];
    const name = 'Demo Name'
    firstPage.drawText(name, {
        x: parseInt(x.value) || 200,
        y: parseInt(y.value) || 300,
        size: parseInt(size.value) || 57,
        font: SanChezFont,
        color: rgb(0.2, 0.84, 0.67),
    });

    
  //  const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    const modifiedPdfBytes = await pdfDoc.save();

    // Convert modified PDF data into a Blob
    const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

    // Create URL for the Blob
    const modifiedPdfUrl = URL.createObjectURL(modifiedPdfBlob);
 
// Open the PDF in a new tab
window.open(modifiedPdfUrl, '_blank');
    loader.style.display = "none";
    view.style.position="static";
    view.style.height="0rem"
    view.style.width="0rem";
    generate.disabled = false
}
check.addEventListener("click", generatePDF);
// PDf View section ends

// certificate generation section starts
const generateall = async () => {
    if(namesInput.value.length==0)
    {
    alert("Enter atleast one name")
    return 
    }
    const names = namesInput.value.split(',').map(name => name.trim());
    //console.log(names);
    const zip = new JSZip();

    const pdfPromises = names.map((name, index) => generateCertificate(name));

    const pdfs = await Promise.all(pdfPromises);

    pdfs.forEach((pdfBlob, index) => {
        zip.file(`${names[index]}.pdf`, pdfBlob);
    });

    zip.generateAsync({ type: 'blob' }).then(zipBlob => {
        saveAs(zipBlob, 'certificates.zip');
    });
}
const generateCertificate = async (name) => {
    const existingPdfBytes = await fetch(use_url).then((res) => {
        return res.arrayBuffer()
    });
   // console.log(existingPdfBytes)

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    pdfDoc.registerFontkit(fontkit);

    const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer())
    SanChezFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    firstPage.drawText(name, {
        x: parseInt(x.value)||200,
        y: parseInt(y.value)||300,
        size:parseInt(size.value)||57,
        font: SanChezFont,
        color: rgb(0.2, 0.84, 0.67),
    });



    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
    pdfDoc.removePages();
}
generate.addEventListener("click", generateall)
// certificate generation section ends

