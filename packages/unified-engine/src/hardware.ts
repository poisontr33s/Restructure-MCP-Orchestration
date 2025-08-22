export type HardwareInfo = {
  os: NodeJS.Platform;
  arch: string;
  gpuVendors: string[];
  cuda?: boolean;
  rocm?: boolean;
  vulkan?: boolean;
  directml?: boolean;
};

export async function detectHardware(): Promise<HardwareInfo> {
  const arch = process.arch;
  const os = process.platform;
  const gpuVendors: string[] = [];

  // Try to read generated hardware profile if available
  try {
    const fs = await import('fs');
    const path = await import('path');
    const profilePath = path.join(process.cwd(), 'docs', 'repo-index', 'hardware-profile.json');
    if (fs.existsSync(profilePath)) {
      type Profile = {
        gpu?: { present?: boolean; gpus?: Array<unknown>; cudaVersion?: string };
        cuda?: { present?: boolean };
        directml?: { present?: boolean };
        vulkan?: { present?: boolean };
      };
      const json: Profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8')) as Profile;
      const nvidia = json?.gpu?.present && Array.isArray(json?.gpu?.gpus) && json.gpu.gpus.length > 0;
      if (nvidia) gpuVendors.push('nvidia');
      const info: HardwareInfo = {
        os,
        arch,
        gpuVendors,
        cuda: Boolean(json?.cuda?.present || json?.gpu?.cudaVersion),
        directml: Boolean(json?.directml?.present),
        vulkan: Boolean(json?.vulkan?.present),
      };
      return info;
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback heuristics when profile isn't present
  if (os === 'win32') {
    return { os, arch, gpuVendors, directml: true, vulkan: true } as HardwareInfo;
  }
  if (os === 'linux') {
    return { os, arch, gpuVendors, cuda: true, vulkan: true } as HardwareInfo;
  }
  if (os === 'darwin') {
    return { os, arch, gpuVendors, vulkan: false } as HardwareInfo;
  }
  return { os, arch, gpuVendors } as HardwareInfo;
}
