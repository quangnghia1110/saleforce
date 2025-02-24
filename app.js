document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load saved progress from localStorage
        const savedProgress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
        
        // Đợi cho DOM load hoàn tất
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const topicsContainer = document.getElementById('topics-container');
        if (!topicsContainer) {
            throw new Error('Topics container not found');
        }

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'search-input';
        searchInput.placeholder = 'Tìm kiếm câu hỏi...';
        topicsContainer.parentElement.insertBefore(searchInput, topicsContainer);

        // Kiểm tra dữ liệu hợp lệ
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }

        Object.entries(data).forEach(([topic, questions]) => {
            if (!Array.isArray(questions)) {
                console.error('Invalid questions format for topic:', topic);
                return;
            }

            const topicElement = document.createElement('div');
            topicElement.className = 'topic';
            
            const topicHeader = document.createElement('div');
            topicHeader.className = 'topic-header';
            const completedCount = questions.filter(q => savedProgress[`${topic}-${q.question}`]).length;
            
            topicHeader.innerHTML = `
                <span class="topic-title">${topic}</span>
                <div class="topic-header-right">
                    <span class="progress-badge">${completedCount}/${questions.length}</span>
                    <span class="toggle-icon">▼</span>
                </div>
            `;
            
            const topicContent = document.createElement('div');
            topicContent.className = 'topic-content';
            
            questions.forEach((qa, index) => {
                if (!qa || typeof qa !== 'object') {
                    console.error('Invalid question format:', qa);
                    return;
                }

                const qaItem = document.createElement('div');
                qaItem.className = 'qa-item';
                const isCompleted = savedProgress[`${topic}-${qa.question}`];
                
                qaItem.innerHTML = `
                    <div class="question-header">
                        <label class="checkbox-container">
                            <input type="checkbox" ${isCompleted ? 'checked' : ''}>
                            <span class="checkmark"></span>
                        </label>
                        <span class="question-number">${index + 1}.</span>
                        <span class="question-text">${qa.question}</span>
                    </div>
                    <div class="answer-container">
                        <div class="answer hidden">${qa.answer}</div>
                    </div>
                    <button class="toggle-answer">Xem câu trả lời</button>
                `;

                // Add event listeners
                const checkbox = qaItem.querySelector('input[type="checkbox"]');
                const toggleButton = qaItem.querySelector('.toggle-answer');
                const answer = qaItem.querySelector('.answer');

                if (checkbox && toggleButton && answer) {
                    checkbox.addEventListener('change', (e) => {
                        const key = `${topic}-${qa.question}`;
                        if (e.target.checked) {
                            savedProgress[key] = true;
                        } else {
                            delete savedProgress[key];
                        }
                        localStorage.setItem('learningProgress', JSON.stringify(savedProgress));
                        
                        const newCompletedCount = questions.filter(q => savedProgress[`${topic}-${q.question}`]).length;
                        const progressBadge = topicHeader.querySelector('.progress-badge');
                        if (progressBadge) {
                            progressBadge.textContent = `${newCompletedCount}/${questions.length}`;
                        }
                    });

                    toggleButton.addEventListener('click', () => {
                        const isHidden = answer.classList.contains('hidden');
                        if (isHidden) {
                            answer.style.display = 'block';
                            setTimeout(() => {
                                answer.classList.remove('hidden');
                            }, 10);
                        } else {
                            answer.classList.add('hidden');
                            setTimeout(() => {
                                answer.style.display = 'none';
                            }, 300);
                        }
                        toggleButton.textContent = isHidden ? 'Ẩn câu trả lời' : 'Xem câu trả lời';
                    });
                }

                topicContent.appendChild(qaItem);
            });
            
            topicHeader.addEventListener('click', (e) => {
                if (!e.target.matches('input[type="checkbox"]')) {
                    const content = topicElement.querySelector('.topic-content');
                    if (content) {
                        content.classList.toggle('active');
                        topicHeader.classList.toggle('active');
                    }
                }
            });
            
            topicElement.appendChild(topicHeader);
            topicElement.appendChild(topicContent);
            topicsContainer.appendChild(topicElement);
        });

        // Add search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.qa-item').forEach(item => {
                const question = item.querySelector('.question-text')?.textContent.toLowerCase() || '';
                const answer = item.querySelector('.answer')?.textContent.toLowerCase() || '';
                const shouldShow = question.includes(searchTerm) || answer.includes(searchTerm);
                item.style.display = shouldShow ? 'block' : 'none';
            });
        });
        
    } catch (error) {
        console.error('Error loading or parsing questions:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Có lỗi khi tải dữ liệu. Vui lòng thử lại sau.';
        document.body.appendChild(errorDiv);
    }
}); 