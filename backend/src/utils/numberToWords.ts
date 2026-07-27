/**
 * Converts a number to Indian Rupee Words format.
 * Example: 12450.50 -> "Rupees Twelve Thousand Four Hundred Fifty and Paisa Fifty Only"
 */

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];

  const tenVal = Math.floor(n / 10);
  const oneVal = n % 10;
  if (n < 100) {
    return (tens[tenVal] + (oneVal > 0 ? " " + ones[oneVal] : "")).trim();
  }

  const hundredVal = Math.floor(n / 100);
  const remainder = n % 100;
  return (
    ones[hundredVal] +
    " Hundred" +
    (remainder > 0 ? " " + convertLessThanThousand(remainder) : "")
  ).trim();
}

export function numberToWordsIndian(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "";
  if (num === 0) return "Rupees Zero Only";

  const absoluteNum = Math.abs(num);
  const wholePart = Math.floor(absoluteNum);
  const decimalPart = Math.round((absoluteNum - wholePart) * 100);

  if (wholePart === 0 && decimalPart === 0) return "Rupees Zero Only";

  let words = "";

  const crore = Math.floor(wholePart / 10000000);
  let rem = wholePart % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundred = rem;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + " Crore ";
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + " Thousand ";
  }
  if (hundred > 0) {
    words += convertLessThanThousand(hundred) + " ";
  }

  words = words.trim();
  let result = "Rupees " + (words ? words : "Zero");

  if (decimalPart > 0) {
    result += " and Paisa " + convertLessThanThousand(decimalPart);
  }

  result += " Only";
  return result;
}
