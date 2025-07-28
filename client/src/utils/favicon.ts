
export function updateFavicon(iconPath: string) {
  const favicon = document.getElementById('favicon') as HTMLLinkElement;
  const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
  
  if (favicon && iconPath) {
    favicon.href = iconPath;
  }
  
  if (appleTouchIcon && iconPath) {
    appleTouchIcon.href = iconPath;
  }
}

export function loadSiteFavicon() {
  // Carrega o favicon do site a partir da configuração
  fetch('/api/config')
    .then(response => response.json())
    .then(configs => {
      const siteIconConfig = configs.find((c: any) => c.key === 'site_icon');
      if (siteIconConfig?.value?.iconPath) {
        updateFavicon(siteIconConfig.value.iconPath);
      }
    })
    .catch(() => {
      // Ignora erros silenciosamente
    });
}
