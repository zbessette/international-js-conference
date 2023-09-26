import { component$, useSignal, useStylesScoped$, useComputed$ } from "@builder.io/qwik";
import { Link, routeLoader$, useLocation } from "@builder.io/qwik-city";
import type { paths } from "@octokit/openapi-types";
import CSS from './index.css?inline';

type OrgReposResponse =
  paths["/users/{username}/repos"]["get"]["responses"]["200"]["content"]["application/json"];

// User cannot ever change the data returned by this endpoint, so it will never be sent to the client
// It will be sent as static html
export const useRepos = routeLoader$(async ({ env, params }) => {
  console.log('Loading repos');
  const response = await fetch(
    `https://api.github.com/users/${params.user}/repos`,
    {
      headers: {
        "User-Agent": "Qwik Workshop",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: "Bearer " + env.get("PRIVATE_GITHUB_ACCESS_TOKEN"),
      },
    }
  );
  return (await response.json()) as OrgReposResponse;
});

export default component$(() => {
  useStylesScoped$(CSS);
  const filter = useSignal("");
  const repositories = useRepos();
  const filteredRepos = useComputed$(() =>
    repositories.value.filter((repo) =>
      repo.full_name.toLowerCase().includes(filter.value.toLowerCase())
    )
  );
  const location = useLocation();

  return (
    <div>
      <h1>Repositories for {location.params.user}</h1>
      <input type="text" bind:value={filter} />
      <ul class="card-list">
        {filteredRepos.value.map((repo) => (
          <li key={repo.full_name} class="card-item">
            {/* Link turns it into client side nav */}
            {/* <a href={`/github/${repo.full_name}`}>{repo.full_name}</a> */}
            <Link href={`/github/${repo.full_name}`}>{repo.full_name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
});
