'use client';

/**
 * Demande la caméra frontale en évitant les caméras infrarouges
 * (ex: Windows Hello), qui apparaissent complètement noires en
 * lumière visible même si le flux est techniquement actif.
 */
export async function obtenirFluxCameraFrontale(): Promise<MediaStream> {
  const flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });

  try {
    const appareils = await navigator.mediaDevices.enumerateDevices();
    const camerasVideo = appareils.filter((d) => d.kind === 'videoinput');
    const nonInfrarouge = camerasVideo.find((d) => !/\bir\b|infrared|infrarouge/i.test(d.label));

    const idActuel = flux.getVideoTracks()[0]?.getSettings().deviceId;

    if (nonInfrarouge && nonInfrarouge.deviceId && nonInfrarouge.deviceId !== idActuel) {
      flux.getTracks().forEach((t) => t.stop());
      return await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: nonInfrarouge.deviceId } }
      });
    }
  } catch {
    // Si l'énumération échoue, on garde le flux initial plutôt que d'échouer.
  }

  return flux;
}
