import execFileAsync from "../utils/exec-file-async";
import isValidPrinter from "../utils/windows-printer-valid";
import throwIfUnsupportedOperatingSystem from "../utils/throw-if-unsupported-os";
import { Printer } from "..";

async function getPrinters(): Promise<Printer[]> {

  function stdoutHandler(stdout: string): Printer[] {
    const parsedPrinters: {
      Name: string;
      DeviceID: string;
      PrinterPaperNames: string;
    }[] = JSON.parse(stdout);

    return parsedPrinters.map((printer) => ({
      name: printer.Name,
      deviceId: printer.DeviceID,
      paperSizes: printer.PrinterPaperNames.split(", ").map((name: string) => name.trim()),
    }));
  }

  try {
    throwIfUnsupportedOperatingSystem();
    const { stdout } = await execFileAsync("Powershell.exe", [
      "-Command",
      `Get-CimInstance Win32_Printer -Property DeviceID,Name,PrinterPaperNames | ForEach-Object { $_ | Add-Member -MemberType NoteProperty -Name PrinterPaperNames -Value ($_.PrinterPaperNames -join ', ') -Force; $_ } | Select-Object Name, DeviceID, PrinterPaperNames | ConvertTo-Json -Depth 2`,
    ]);
    return stdoutHandler(stdout);
  } catch (error) {
    throw error;
  }
}

export default getPrinters;
