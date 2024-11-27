import execFileAsync from "../utils/exec-file-async";
import isValidPrinter from "../utils/windows-printer-valid";
import throwIfUnsupportedOperatingSystem from "../utils/throw-if-unsupported-os";
import { Printer } from "..";

async function getPrinters(): Promise<Printer[]> {
  function stdoutHandler(stdout: string) {
    const printers: Printer[] = [];

    stdout
      .split(/(\r?\n){2,}/)
      .map((printer) => printer.trim())
      .filter((printer) => !!printer)
      .forEach((printer) => {
        const { isValid, printerData } = isValidPrinter(printer);

        if (!isValid) return;

        printers.push(printerData);
      });

    return printers;
  }

  try {
    throwIfUnsupportedOperatingSystem();
    const { stdout } = await execFileAsync("Powershell.exe", [
      "-Command",
      //`Get-CimInstance Win32_Printer -Property DeviceID,Name,PrinterPaperNames`,
      `Get-CimInstance Win32_Printer -Property DeviceID,Name,PrinterPaperNames | ForEach-Object { $_ | Add-Member -MemberType NoteProperty -Name PrinterPaperNames -Value ($_.PrinterPaperNames -join ', ') -Force; $_ } | Select-Object Name, DeviceID, PrinterPaperNames | Format-List`
    ]);
    return stdoutHandler(stdout);
  } catch (error) {
    throw error;
  }
}

export default getPrinters;
