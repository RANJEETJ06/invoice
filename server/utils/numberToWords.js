const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function below100(n) {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? ' ' + ones[o] : '');
}

function below1000(n) {
  if (n < 100) return below100(n);
  const h = Math.floor(n / 100);
  const r = n % 100;
  return ones[h] + ' Hundred' + (r ? ' ' + below100(r) : '');
}

function indianWords(num) {
  if (num === 0) return 'Zero';
  let words = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const rest = num;

  if (crore) words += below1000(crore) + ' Crore ';
  if (lakh) words += below1000(lakh) + ' Lakh ';
  if (thousand) words += below1000(thousand) + ' Thousand ';
  if (rest) words += below1000(rest);
  return words.trim();
}

function amountInWords(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = 'Rupees ' + indianWords(rupees);
  if (paise > 0) words += ' and ' + indianWords(paise) + ' Paise';
  return words + ' Only';
}

module.exports = { amountInWords, indianWords };
