export async function loadAllQuizzes() {
    let allQuestions = [];
    let allChapters = [];

    try {
        const manifestResponse = await fetch('quizzes/quizzes.json');
        if (!manifestResponse.ok) {
            throw new Error(`Failed to load quiz manifest: ${manifestResponse.statusText}`);
        }
        const quizFiles = await manifestResponse.json();

        const fetchPromises = quizFiles.map(file => 
            fetch(file)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Failed to load quiz file: ${file}`);
                    }
                    return res.json();
                })
        );
        
        const quizzes = await Promise.all(fetchPromises);

        quizzes.forEach(quiz => {
            allChapters.push(quiz.title);
            quiz.questions.forEach(q => {
                q.chapter = quiz.title;
                allQuestions.push(q);
            });
        });

        return { allQuestions, allChapters: [...new Set(allChapters)].sort() };

    } catch (error) {
        console.error("Error loading quiz data:", error);
        return { allQuestions: [], allChapters: [] };
    }
}