import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const EXCEL_FILE = path.join(process.cwd(), 'data', 'transport-data.xlsx');
const JSON_FILE = path.join(process.cwd(), 'data', 'transport-data.json');

function convert() {
  console.log('📖 Четене на Excel...');
  console.log('   Файл:', EXCEL_FILE);

  if (!fs.existsSync(EXCEL_FILE)) {
    console.error('❌ Excel файлът не е намерен!');
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  console.log('   Sheet:', sheetName);

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`✅ Прочетени ${data.length - 1} реда.`);
  console.log('💾 Записване в JSON...');

  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));

  const size = (fs.statSync(JSON_FILE).size / 1024).toFixed(1);
  console.log(`✅ Записани в ${JSON_FILE} (${size} KB)`);
}

convert();