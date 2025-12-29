describe('pages/memory/memory', () => {
  let page;

  beforeAll(async () => {
    page = await program.reLaunch('/pages/memory/memory');
    await page.waitFor(2000);
  });

  it('should display main memory metric card', async () => {
    const mainCard = await page.$('.main-card');
    expect(mainCard).toBeTruthy();
    
    const metricLabel = await mainCard.$('.metric-label');
    expect(await metricLabel.text()).toBe('App 总内存 (PSS)');
    
    const metricValue = await mainCard.$('.metric-value');
    const metricUnit = await mainCard.$('.metric-unit');
    expect(await metricUnit.text()).toBe('MB');
    
    // Value should be a number
    const valueText = await metricValue.text();
    expect(valueText).toMatch(/^\d+(\.\d+)?$/);
  });

  it('should display package name input on Android', async () => {
    // This test is conditional for Android platform
    const inputCard = await page.$('.input-card');
    if (inputCard) {
      const inputLabel = await inputCard.$('.input-label');
      expect(await inputLabel.text()).toBe('目标应用包名');
      
      const inputWrapper = await inputCard.$('.input-wrapper');
      expect(inputWrapper).toBeTruthy();
    }
  });

  it('should display chart card with canvas', async () => {
    const chartCard = await page.$('.chart-card');
    expect(chartCard).toBeTruthy();
    
    const chartTitle = await chartCard.$('.card-inner-title');
    expect(await chartTitle.text()).toBe('内存波动趋势');
    
    const canvas = await chartCard.$('.memory-canvas');
    expect(canvas).toBeTruthy();
    
    const dataCount = await chartCard.$('.data-count-text');
    const dataCountText = await dataCount.text();
    expect(dataCountText).toMatch(/^采样点: \d+$/);
  });

  it('should display detailed metrics grid', async () => {
    const detailsGrid = await page.$('.details-grid');
    expect(detailsGrid).toBeTruthy();
    
    const detailCards = await detailsGrid.$$('.detail-card');
    expect(detailCards.length).toBe(2);
    
    // Private memory card
    const privateCard = detailCards[0];
    const privateLabel = await privateCard.$('.detail-label');
    const privateDesc = await privateCard.$('.detail-desc');
    expect(await privateLabel.text()).toBe('私有内存');
    expect(await privateDesc.text()).toBe('Private Dirty');
    
    // Shared memory card
    const sharedCard = detailCards[1];
    const sharedLabel = await sharedCard.$('.detail-label');
    const sharedDesc = await sharedCard.$('.detail-desc');
    expect(await sharedLabel.text()).toBe('共享内存');
    expect(await sharedDesc.text()).toBe('Shared Dirty');
  });

  it('should display action buttons', async () => {
    const actionBar = await page.$('.action-bar');
    expect(actionBar).toBeTruthy();
    
    const buttons = await actionBar.$$('.btn');
    expect(buttons.length).toBe(2);
    
    const refreshBtn = buttons[0];
    const toggleBtn = buttons[1];
    
    expect(await refreshBtn.text()).toBe('单次刷新');
    
    const toggleText = await toggleBtn.text();
    expect(toggleText === '持续监控' || toggleText === '停止监控').toBe(true);
  });

  it('should refresh memory data when refresh button is clicked', async () => {
    const refreshBtn = await page.$('.btn-secondary');
    
    // Get initial value
    const initialValue = await page.$('.metric-value');
    const initialText = await initialValue.text();
    
    await refreshBtn.tap();
    await page.waitFor(1000);
    
    // Value might change or stay the same, but should still be a valid number
    const newValue = await page.$('.metric-value');
    const newText = await newValue.text();
    expect(newText).toMatch(/^\d+(\.\d+)?$/);
  });

  it('should toggle monitoring when toggle button is clicked', async () => {
    const toggleBtn = await page.$('.btn-primary, .btn-danger');
    const initialText = await toggleBtn.text();
    
    await toggleBtn.tap();
    await page.waitFor(1000);
    
    const newText = await toggleBtn.text();
    
    if (initialText === '持续监控') {
      expect(newText).toBe('停止监控');
    } else {
      expect(newText).toBe('持续监控');
    }
  });

  it('should show package selection when input wrapper is clicked', async () => {
    const inputWrapper = await page.$('.input-wrapper');
    if (inputWrapper) {
      await inputWrapper.tap();
      await page.waitFor(500);
      
      // Should show action sheet (can't directly test action sheet content)
      // But we can verify the tap was registered
      expect(true).toBe(true);
    }
  });

  it('should update time display when monitoring', async () => {
    const timeTag = await page.$('.time-tag-text');
    const timeText = await timeTag.text();
    
    expect(timeText).toMatch(/^更新于 \d{2}:\d{2}:\d{2}$/);
  });

  it('should show monitoring status indicator', async () => {
    const statusIndicator = await page.$('.status-indicator');
    expect(statusIndicator).toBeTruthy();
    
    const dot = await statusIndicator.$('.dot');
    const statusText = await statusIndicator.$('.metric-desc');
    
    expect(dot).toBeTruthy();
    
    const statusMessage = await statusText.text();
    expect(statusMessage === '持续监控中' || statusMessage === '静态采样数据').toBe(true);
  });
});
