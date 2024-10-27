interface IChapter {
    chapterName: string;
    chapterDescription: string;
    filePath: string;
    _id: string;
}

interface ISubject {
    subjectId: string;
    chapters: IChapter[];
    subjectName: string;
}

interface IAssignedClass {
    _id: string;
    name: string;
}

interface ISyllabus {
    _id: string;
    syllabusName: string;
    schoolId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    subjects: ISubject[];
    assignedClasses: IAssignedClass[];
}

export type { ISyllabus, ISubject, IChapter, IAssignedClass };

