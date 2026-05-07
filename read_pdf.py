import pdfplumber

with pdfplumber.open(r'd:\AFACULTAD\Ultimo Semestre\Prog 4 - Pereyra - Mampel\Documentation\TPI_PROG4_FOOD_STORE_v4.pdf') as pdf:
    with open(r'd:\AFACULTAD\Ultimo Semestre\Prog 4 - Pereyra - Mampel\Documentation\tpi_content.txt', 'w', encoding='utf-8') as out:
        for i, page in enumerate(pdf.pages):
            out.write(f'--- PAGE {i+1} ---\n')
            txt = page.extract_text()
            if txt:
                out.write(txt + '\n')

print("Done!")
