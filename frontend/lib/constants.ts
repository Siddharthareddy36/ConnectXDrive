export const ALLOWED_BRANCHES = ['DS', 'IT', 'AIML', 'CS-Cybersecurity', 'CSE'] as const;

export type Branch = typeof ALLOWED_BRANCHES[number];

export const BRANCH_OPTIONS = [
    { value: 'DS', label: 'Data Science (DS)' },
    { value: 'IT', label: 'Information Technology (IT)' },
    { value: 'AIML', label: 'Artificial Intelligence & Machine Learning (AIML)' },
    { value: 'CS-Cybersecurity', label: 'Cybersecurity (CS-Cybersecurity)' },
    { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
];
