export type JobConfig = {
    name?: string;
    requires?: string[];
    filters?: Branches & Tags;
}

type Branches = {
    branches?: Only | Ignore
}

type Tags = {
    tags?: Only | Ignore
}

type Only = {
    only: string | string[]
}

type Ignore = {
    ignore: string | string[]
}

export class Job {
    constructor(
        public id: string,
        public requires: Set<string>,
        private filterBranches: Branches,
        private filterTags: Tags,
    ) { }

    public static fromConfig(conf: { [key: string]: JobConfig } | string): Job {
        if (typeof conf === 'string') {
            return new Job(conf, new Set(), {}, {})
        }
        const jobId = Object.keys(conf)[0];
        const jobConfig = conf[jobId];
        const id = jobConfig.name ?? jobId;
        const requires = new Set(jobConfig.requires ?? []);
        const filterBranches = jobConfig.filters?.branches ?? {}
        const filterTags = jobConfig.filters?.tags ?? {}
        return new Job(id, requires, filterBranches, filterTags);
    }

    public runOnBranchOrTag(branchOrTag: string): boolean {
        return this.runOnBranch(branchOrTag) || this.runOnTag(branchOrTag)
    }

    private runOnBranch(branch: string): boolean {
        if (this.filterBranches.branches == null) {
            return true
        }
        if ('only' in this.filterBranches.branches) {
            const only = this.filterBranches.branches.only
            if (typeof only === 'string') {
                return match(only, branch)
            }
                for (const o of only) {
                    if (match(o, branch)) {
                        return true
                    }
                }
        }
        if ('ignore' in this.filterBranches.branches) {
            const ignore = this.filterBranches.branches.ignore
            if (typeof ignore === 'string') {
                return !match(ignore, branch)
            }
            for (const i of ignore) {
                if (match(i, branch)) {
                    return false;
                }
            }
        }
        return false;
    }

    private runOnTag(tag: string): boolean {
        if (this.filterTags.tags == null) {
            return true
        }
        if ('only' in this.filterTags.tags) {
            const only = this.filterTags.tags.only
            if (typeof only === 'string') {
                return match(only, taa)
            }
                for (const o of only) {
                    if (match(o, tag)) {
                        return true
                    }
                }
        }
        if ('ignore' in this.filterTags.tags) {
            const ignore = this.filterTags.tags.ignore
            if (typeof ignore === 'string') {
                return !match(ignore, tag)
            }
            for (const i of ignore) {
                if (match(i, tag)) {
                    return false;
                }
            }
        }
        return false;
    }

    public toMermaid(): string[] {
        const result = [`    ${this.id}`]
        this.requires.forEach(r => result.push(`    ${r} --> ${this.id}`))
        return result
    }
}

function match(maybeRegexString: string, testee: string): boolean {
    if (maybeRegexString.startsWith('/')) {
        return eval(maybeRegexString).test(testee)
    }
    return testee === maybeRegexString
}