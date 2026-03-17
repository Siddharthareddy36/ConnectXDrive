export const ALLOWED_BRANCHES = [
    'CSE (Computer Science and Engineering)',
    'CSE (Data Science)',
    'CSE (Artificial Intelligence & Machine Learning)',
    'CSE (Cyber Security)',
    'Information Technology (IT)',
    'ARVR & Blockchain Technology',
    'Electronics and Communication Engineering (ECE)'
] as const;

export type Branch = typeof ALLOWED_BRANCHES[number];

export const BRANCH_OPTIONS = [
    { value: 'CSE (Computer Science and Engineering)', label: 'CSE (Computer Science and Engineering)' },
    { value: 'CSE (Data Science)', label: 'CSE (Data Science)' },
    { value: 'CSE (Artificial Intelligence & Machine Learning)', label: 'CSE (Artificial Intelligence & Machine Learning)' },
    { value: 'CSE (Cyber Security)', label: 'CSE (Cyber Security)' },
    { value: 'Information Technology (IT)', label: 'Information Technology (IT)' },
    { value: 'ARVR & Blockchain Technology', label: 'ARVR & Blockchain Technology' },
    { value: 'Electronics and Communication Engineering (ECE)', label: 'Electronics and Communication Engineering (ECE)' },
];
