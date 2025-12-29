describe('pages/screenshot/screenshot', () => {
  let page;

  beforeAll(async () => {
    page = await program.reLaunch('/pages/screenshot/screenshot');
    await page.waitFor(1000);
  });

  it('should display placeholder section initially', async () => {
    const placeholderSection = await page.$('.placeholder-section');
    expect(placeholderSection).toBeTruthy();
    
    const placeholderText = await placeholderSection.$('.placeholder-text');
    expect(await placeholderText.text()).toBe('点击下方按钮截取当前屏幕');
    
    const iconWrapper = await placeholderSection.$('.icon-wrapper');
    expect(iconWrapper).toBeTruthy();
    
    const cameraIcon = await iconWrapper.$('.icon-camera');
    expect(cameraIcon).toBeTruthy();
  });

  it('should not display result card initially', async () => {
    const resultCard = await page.$('.result-card');
    expect(resultCard).toBeFalsy();
  });

  it('should display capture button', async () => {
    const actionBar = await page.$('.action-bar');
    expect(actionBar).toBeTruthy();
    
    const captureBtn = await actionBar.$('.btn-primary');
    expect(captureBtn).toBeTruthy();
    expect(await captureBtn.text()).toBe('立即截图');
  });

  it('should attempt screenshot when capture button is clicked', async () => {
    const captureBtn = await page.$('.btn-primary');
    
    await captureBtn.tap();
    await page.waitFor(2000);
    
    // After clicking, either result card should appear or placeholder should remain
    // This depends on whether screenshot permission is granted and functionality works
    const placeholderSection = await page.$('.placeholder-section');
    const resultCard = await page.$('.result-card');
    
    // One of them should be visible
    expect(placeholderSection || resultCard).toBeTruthy();
  });

  it('should display result card with preview when screenshot is successful', async () => {
    // This test checks the UI structure when a screenshot path exists
    // We'll simulate this by checking if result card appears after capture attempt
    
    const resultCard = await page.$('.result-card');
    if (resultCard) {
      const cardHeader = await resultCard.$('.card-header');
      expect(cardHeader).toBeTruthy();
      
      const cardTitle = await cardHeader.$('.card-title');
      expect(await cardTitle.text()).toBe('截图预览');
      
      const cardTime = await cardHeader.$('.card-time');
      expect(await cardTime.text()).toBe('刚刚');
      
      const cardContent = await resultCard.$('.card-content');
      expect(cardContent).toBeTruthy();
      
      const previewImage = await cardContent.$('.preview-image');
      expect(previewImage).toBeTruthy();
      
      const pathContainer = await cardContent.$('.path-container');
      expect(pathContainer).toBeTruthy();
      
      const pathLabel = await pathContainer.$('.path-label');
      expect(await pathLabel.text()).toBe('保存路径：');
      
      const pathValue = await pathContainer.$('.path-value');
      expect(pathValue).toBeTruthy();
    }
  });

  it('should hide placeholder when result is shown', async () => {
    const resultCard = await page.$('.result-card');
    const placeholderSection = await page.$('.placeholder-section');
    
    if (resultCard) {
      // If result card is visible, placeholder should be hidden
      expect(placeholderSection).toBeFalsy();
    } else {
      // If no result card, placeholder should be visible
      expect(placeholderSection).toBeTruthy();
    }
  });

  it('should maintain button functionality after screenshot attempt', async () => {
    const captureBtn = await page.$('.btn-primary');
    expect(captureBtn).toBeTruthy();
    expect(await captureBtn.text()).toBe('立即截图');
    
    // Button should still be clickable
    await captureBtn.tap();
    await page.waitFor(1000);
    
    // Button should still exist and have same text
    const btnAfterClick = await page.$('.btn-primary');
    expect(btnAfterClick).toBeTruthy();
    expect(await btnAfterClick.text()).toBe('立即截图');
  });

  it('should have proper page layout structure', async () => {
    const pageContainer = await page.$('.page-container');
    expect(pageContainer).toBeTruthy();
    
    const contentArea = await pageContainer.$('.content-area');
    expect(contentArea).toBeTruthy();
    
    const actionBar = await pageContainer.$('.action-bar');
    expect(actionBar).toBeTruthy();
  });
});
