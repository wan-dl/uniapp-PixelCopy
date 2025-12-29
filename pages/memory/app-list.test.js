describe('pages/memory/app-list', () => {
  let page;

  beforeAll(async () => {
    page = await program.reLaunch('/pages/memory/app-list');
    await page.waitFor(2000);
  });

  it('should display search header with input field', async () => {
    const searchHeader = await page.$('.search-header');
    expect(searchHeader).toBeTruthy();
    
    const searchWrapper = await searchHeader.$('.search-wrapper');
    expect(searchWrapper).toBeTruthy();
    
    const searchIcon = await searchWrapper.$('.search-icon');
    expect(await searchIcon.text()).toBe('🔍');
    
    const searchInput = await searchWrapper.$('.search-input');
    expect(searchInput).toBeTruthy();
    expect(await searchInput.attribute('placeholder')).toBe('搜索包名...');
  });

  it('should display content area with scroll view', async () => {
    const contentArea = await page.$('.content-area');
    expect(contentArea).toBeTruthy();
    
    const listContainer = await contentArea.$('.list-container');
    expect(listContainer).toBeTruthy();
  });

  it('should show loading state initially', async () => {
    const emptyState = await page.$('.empty-state');
    if (emptyState) {
      const emptyText = await emptyState.$('.empty-text');
      const text = await emptyText.text();
      expect(text === '正在加载...' || text === '未找到匹配的包名').toBe(true);
    }
  });

  it('should display app list items when loaded', async () => {
    // Wait for apps to load
    await page.waitFor(3000);
    
    const listItems = await page.$$('.list-item');
    
    if (listItems.length > 0) {
      // Check first item structure
      const firstItem = listItems[0];
      const itemText = await firstItem.$('.item-text');
      const itemArrow = await firstItem.$('.item-arrow');
      
      expect(itemText).toBeTruthy();
      expect(itemArrow).toBeTruthy();
      
      // Item text should contain package name format
      const text = await itemText.text();
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it('should filter apps when searching', async () => {
    const searchInput = await page.$('.search-input');
    
    // Get initial count
    const initialItems = await page.$$('.list-item');
    const initialCount = initialItems.length;
    
    if (initialCount > 0) {
      // Enter search query
      await searchInput.input('com');
      await page.waitFor(500);
      
      const filteredItems = await page.$$('.list-item');
      
      // Should show filtered results or empty state
      expect(filteredItems.length <= initialCount).toBe(true);
      
      // All visible items should contain 'com'
      for (let item of filteredItems) {
        const itemText = await item.$('.item-text');
        const text = await itemText.text();
        expect(text.toLowerCase()).toContain('com');
      }
    }
  });

  it('should show clear icon when search has text', async () => {
    const searchInput = await page.$('.search-input');
    
    await searchInput.input('test');
    await page.waitFor(300);
    
    const clearIcon = await page.$('.clear-icon');
    expect(clearIcon).toBeTruthy();
    expect(await clearIcon.text()).toBe('✕');
  });

  it('should clear search when clear icon is clicked', async () => {
    const clearIcon = await page.$('.clear-icon');
    if (clearIcon) {
      await clearIcon.tap();
      await page.waitFor(300);
      
      const searchInput = await page.$('.search-input');
      const inputValue = await searchInput.value();
      expect(inputValue).toBe('');
      
      // Clear icon should be hidden
      const clearIconAfter = await page.$('.clear-icon');
      expect(clearIconAfter).toBeFalsy();
    }
  });

  it('should show empty state when no matches found', async () => {
    const searchInput = await page.$('.search-input');
    
    // Search for something that likely won't match
    await searchInput.input('nonexistentpackagename12345');
    await page.waitFor(500);
    
    const listItems = await page.$$('.list-item');
    expect(listItems.length).toBe(0);
    
    const emptyState = await page.$('.empty-state');
    expect(emptyState).toBeTruthy();
    
    const emptyText = await emptyState.$('.empty-text');
    expect(await emptyText.text()).toBe('未找到匹配的包名');
  });

  it('should navigate back when app is selected', async () => {
    // Clear search first
    const searchInput = await page.$('.search-input');
    await searchInput.input('');
    await page.waitFor(500);
    
    const listItems = await page.$$('.list-item');
    
    if (listItems.length > 0) {
      const firstItem = listItems[0];
      await firstItem.tap();
      await page.waitFor(1000);
      
      // Should navigate back to memory page
      expect(page.path).toBe('/pages/memory/memory');
    }
  });

  it('should maintain proper page layout structure', async () => {
    // Navigate back to app-list for this test
    await page.navigateTo('/pages/memory/app-list');
    await page.waitFor(1000);
    
    const pageContainer = await page.$('.page-container');
    expect(pageContainer).toBeTruthy();
    
    const searchHeader = await pageContainer.$('.search-header');
    expect(searchHeader).toBeTruthy();
    
    const contentArea = await pageContainer.$('.content-area');
    expect(contentArea).toBeTruthy();
  });

  it('should handle hover effects on list items', async () => {
    const listItems = await page.$$('.list-item');
    
    if (listItems.length > 0) {
      const firstItem = listItems[0];
      
      // Simulate hover by checking if hover-class attribute exists
      const hoverClass = await firstItem.attribute('hover-class');
      expect(hoverClass).toBe('list-item-hover');
    }
  });
});
