describe('pages/index/index', () => {
  let page;

  beforeAll(async () => {
    page = await program.reLaunch('/pages/index/index');
    await page.waitFor(1000);
  });

  it('should display correct app title and subtitle', async () => {
    const titleEl = await page.$('.app-title');
    const subtitleEl = await page.$('.app-subtitle');
    
    expect(await titleEl.text()).toBe('PixelCopy');
    expect(await subtitleEl.text()).toBe('开发者工具箱');
  });

  it('should display all menu cards', async () => {
    const menuCards = await page.$$('.menu-card');
    expect(menuCards.length).toBe(3);
    
    // Check memory card
    const memoryCard = menuCards[0];
    const memoryTitle = await memoryCard.$('.card-title');
    const memoryDesc = await memoryCard.$('.card-desc');
    expect(await memoryTitle.text()).toBe('内存监控');
    expect(await memoryDesc.text()).toBe('实时监测应用内存使用情况');
    
    // Check screenshot card
    const screenshotCard = menuCards[1];
    const screenshotTitle = await screenshotCard.$('.card-title');
    const screenshotDesc = await screenshotCard.$('.card-desc');
    expect(await screenshotTitle.text()).toBe('截图功能');
    expect(await screenshotDesc.text()).toBe('原生 PixelCopy 截图与保存');
    
    // Check QR code card
    const qrcodeCard = menuCards[2];
    const qrcodeTitle = await qrcodeCard.$('.card-title');
    const qrcodeDesc = await qrcodeCard.$('.card-desc');
    expect(await qrcodeTitle.text()).toBe('二维码扫描');
    expect(await qrcodeDesc.text()).toBe('MLKit 相机扫码与识别');
  });

  it('should navigate to memory page when memory card is clicked', async () => {
    const memoryCard = await page.$('.menu-card');
    await memoryCard.tap();
    await page.waitFor(1000);
    
    expect(page.path).toBe('/pages/memory/memory');
  });

  it('should navigate to screenshot page when screenshot card is clicked', async () => {
    await page.navigateBack();
    await page.waitFor(500);
    
    const menuCards = await page.$$('.menu-card');
    const screenshotCard = menuCards[1];
    await screenshotCard.tap();
    await page.waitFor(1000);
    
    expect(page.path).toBe('/pages/screenshot/screenshot');
  });

  it('should navigate to qrcode page when qrcode card is clicked', async () => {
    await page.navigateBack();
    await page.waitFor(500);
    
    const menuCards = await page.$$('.menu-card');
    const qrcodeCard = menuCards[2];
    await qrcodeCard.tap();
    await page.waitFor(1000);
    
    expect(page.path).toBe('/pages/qrcode/qrcode');
  });
});
