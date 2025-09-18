import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getVersion(): string {
  try {
    // Read package.json to get version
    const packageJsonPath = join(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch {
    return 'unknown';
  }
}

function displayAsciiLogo(): void {
  // Define the colors for the FlyonUI primary color in gradient variations.

  // Converting to hex and creating a subtle gradient
  const gradientColors = [
    chalk.hex('#8A73DB'), // Lighter shade
    chalk.hex('#7E66D6'),
    chalk.hex('#7359D1'), // Primary color
    chalk.hex('#6A4FCC'),
    chalk.hex('#614AC7'), // Darker shade
  ];

  // Define the color for the inner part of the logo (the "kernel").
  const kernelColor = chalk.white.bold;

  // The ASCII art for the logo.
  const logo = [
    ' @@@@@@@@@@@@@@@@@  ',
    '@@@@@@@@@@@@@@@@@@@@',
    '@@@@@@@@    @@@@@@@@',
    '@@@@@@@      @@@@@@@',
    '@@@@@@  @@@@  @@@@@@',
    '@@@@   @@@@@@   @@@@',
    '@@@@@@@@@   @@@@@@@@',
    '@@@@@@@@@@@@@@@@@@@@',
    ' @@@@@@@@@@@@@@@@@@ ',
  ];

  const textArt = [
    '                                      ',
    '                                      ',
    '    ________                        _ ',
    '   / ____/ /_  _______ _____ __  __(_)',
    '  / /_  / / / / / __  / __  / / / / / ',
    ' / __/ / / /_/ / /_/ / / / / /_/ / /  ',
    '/_/   /_/___, /_____/_/ /_/___,_/_/   ',
    '        /____/                        ',
    '                                      ',
  ];

  console.log('');

  // Display logo and text side by side
  for (let i = 0; i < Math.max(logo.length, textArt.length); i++) {
    let line = '';

    // Add the logo part
    if (i < logo.length) {
      const logoLine = logo[i]!;
      const outerColor =
        gradientColors[i] || gradientColors[gradientColors.length - 1]!;
      let coloredLogoLine = '';

      for (const char of logoLine) {
        if (char === '#' || char === '\\') {
          coloredLogoLine += kernelColor(char);
        } else {
          coloredLogoLine += outerColor(char);
        }
      }
      line += `  ${coloredLogoLine}`;
    } else {
      line += `  ${' '.repeat(12)}`; // Maintain spacing when logo is shorter
    }

    // Add spacing between logo and text
    line += '    ';

    // Add the text part
    if (i < textArt.length) {
      const textLine = textArt[i]!;
      // Apply gradient color to text as well
      const textColor = chalk.white.bold;
      // gradientColors[i] || gradientColors[gradientColors.length - 1]!;
      line += textColor(textLine);
    }

    console.log(line);
  }

  console.log('');
}

export function printBanner(silent: boolean): void {
  if (silent) {
    return;
  }

  const version = getVersion();

  /**
   * This function logs an ASCII art representation of the logo to the console.
   * It uses chalk to apply a blue and purple gradient, similar to the provided image,
   * with a white-filled center.
   */

  // createAsciiCircle(10, 'W', chalk.blue);
  displayAsciiLogo();
  console.log();
  console.log(
    chalk.hex('#7359D1').bold('     FLYONUI EXTENSION') +
      chalk.gray(` v${version}`),
  );
  console.log();
  console.log();
}

export function printCompactBanner(silent: boolean): void {
  if (silent) {
    return;
  }

  const version = getVersion();

  console.log();
  console.log(
    chalk.hex('#7359D1').bold('  FLYONUI') + chalk.gray(` v${version}`),
  );
  console.log();
}
