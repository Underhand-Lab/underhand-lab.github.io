// Tag Search Logic - Separated for search.html
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');
    const resultsContainer = document.getElementById('search-results');
    const titleElement = document.getElementById('search-title');
    const statusContainer = document.getElementById('search-status');
    const searchInput = document.getElementById('search-input');

    let allData = [];

    // 페이지 로드 시 URL에 tag 파라미터가 있으면 검색창에 즉시 주입
    if (tag && searchInput) {
        searchInput.value = tag;
    }

    const renderResults = (data) => {
        const template = document.getElementById('portfolio-card-template').innerHTML;

        if (data.length > 0) {
            statusContainer.innerHTML = '';
            resultsContainer.innerHTML = data.map(item => `
                ${template.replace(/{url}/g, item.url)
                          .replace(/{summary}/g, item.summary || '')
                          .replace(/{thumbnail}/g, item.thumbnail || '')
                          .replace(/{title}/g, item.title)}
            `).join('');

            // 애니메이션 효과 적용
            setTimeout(() => {
                const items = resultsContainer.querySelectorAll('.portfolio-item');
                items.forEach((item, index) => {
                    item.style.cssText = "opacity: 0; transform: translateY(20px); transition: all 0.5s ease;";
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 50);
                });
            }, 100);
        } else {
            resultsContainer.innerHTML = '';
            statusContainer.innerHTML = `
                <div class="no-results" style="padding: 3rem; opacity: 0.6;">
                    <i class="fa fa-folder-open fa-3x mb-3"></i>
                    <p>일치하는 프로젝트를 찾지 못했습니다.</p>
                </div>
            `;
        }
    };

    const performSearch = (query) => {
        if (!query) {
            if (titleElement) titleElement.style.display = 'none';
            statusContainer.innerHTML = '<p class="text-center mt-5" style="opacity: 0.5;">검색할 키워드를 입력하거나 태그를 선택해주세요.</p>';
            resultsContainer.innerHTML = '';
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = allData.filter(item => 
            (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
            (item.summary && item.summary.toLowerCase().includes(lowerQuery)) ||
            (item.tags && item.tags.some(t => t.toLowerCase().includes(lowerQuery)))
        );

        if (titleElement) titleElement.style.display = 'block';
        if (titleElement) titleElement.textContent = `"${query}" 검색 결과`;
        renderResults(filtered);
    };

    // 초기 데이터 로드
    fetch('./search.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            
            if (tag) {
                performSearch(tag);
            } else {
                if (titleElement) titleElement.style.display = 'none';
                statusContainer.innerHTML = '<p class="text-center mt-5">검색할 키워드를 입력하거나 태그를 선택해주세요.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching search data:', error);
            statusContainer.innerHTML = '<p class="text-center text-danger">데이터를 불러오는 중 오류가 발생했습니다.</p>';
        });

    // 검색창 입력 이벤트 감지
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });
});