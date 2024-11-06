import env from "dotenv";
import { Hive } from "./src/index.ts";
import { Task, Tool } from "./src/models.ts";
import { LLamaModel } from "./src/llms/llamaGroq.ts";

import { GoogleSearchTool } from "./src/tools/googleSearch.ts";
import { WebSumarizer } from "./src/tools/webSiteSummarizer.ts";
import { WeatherTool } from "./src/tools/weather.ts";

import { Agent } from "./src/agent/index.ts";

import { Cognitive } from "./src/agent/cognitive.ts";

env.config();

const llama = new LLamaModel();

const Rafael = new Agent({
  backstory: "I'm Rafael, I'm an internet user. I want to explore the web.",
  goal: "Use the web, he just want explore",
  name: "Rafael",
  role: "Internet User",
  tools: [WeatherTool, GoogleSearchTool],
});

const main = async () => {
  const cognitive = new Cognitive(llama, Rafael);

  await Rafael.standalone({
    prompt: "Me de um resumo sobre as ultimas noticias que aconteceram em belford roxo, tambem me diga a temperatura atual.",
    model: llama,
  }).execute()  
};

main();
