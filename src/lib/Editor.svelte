<script lang="ts">
    import { onMount } from "svelte";
    import YAML from "yaml";
    import { render as renderDiagram } from "./utils/mermaid";
    import type { MermaidConfig } from "mermaid";

    onMount(() => {});

    let container: HTMLDivElement;
    let yamlCode: string = "";
    let mermaidCode: string = "";
    const mermaidConfig: MermaidConfig = {
        startOnLoad: true,
        theme: "default",
    };

    function yamlToMermaid(yml: any): string {
        let converted = ["flowchart LR"];
        // FIXME: check_all only
        for (const job of yml.workflows.check_all.jobs) {
            const jobId = Object.keys(job)[0];
            const jobConfig = job[jobId];
            const jobName = jobConfig.name ?? jobId;
            converted.push(`    ${jobName}`);
            if (!Object.hasOwn(jobConfig, "requires")) {
                continue;
            }
            for (const r of jobConfig.requires) {
                converted.push(`    ${r} --> ${jobName}`);
            }
        }
        return converted.join("\n");
    }

    async function onYamlChanged() {
        const yml = YAML.parse(yamlCode);
        mermaidCode = yamlToMermaid(yml);
        console.log(mermaidCode)

        const graphDiv = document.getElementById("graph-div");
        const { svg, bindFunctions } = await renderDiagram(
            mermaidConfig,
            mermaidCode,
            "graph-div"
        );
        if (svg.length > 0) {
            container.innerHTML = svg;
            console.log({ svg });
            const graphDiv = document.getElementById("graph-div");
            if (!graphDiv) {
                throw new Error("graph-div not found");
            }
            graphDiv.setAttribute("height", "100%");
            graphDiv.style.maxWidth = "100%";
            if (bindFunctions) {
                bindFunctions(graphDiv);
            }
        }
    }
</script>

<textarea
    bind:value={yamlCode}
    on:change={onYamlChanged}
    placeholder="Paste your config.yml here"
/>

<div bind:this={container} />

<style>
    textarea {
        width: 100%;
        height: 200px;
    }
</style>
