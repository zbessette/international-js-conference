import { Resource, component$, useResource$, useSignal, useTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";
import type { paths } from "@octokit/openapi-types";

export const onGet: RequestHandler = async ({ json, request }) => {
  if (request.headers.get('Accept') === 'application/json') {
    json(200, 
     { body: 'good!' },
    );
  }
};



type SearchUsersResponse =
  paths["/search/users"]["get"]["responses"]["200"]["content"]["application/json"];

const fetchUsers = server$(async function (query: string) {
  const response = await fetch(
    "https://api.github.com/search/users?q=" + query,
    {
      headers: {
        "User-Agent": "Qwik Workshop",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization:
          "Bearer " + this.env.get("PRIVATE_GITHUB_ACCESS_TOKEN"),
      },
    }
  );
  const users = (await response.json()) as SearchUsersResponse;
  return users.items;
});

export default component$(() => {
  const filter = useSignal('');
  const debouncedFilter = useSignal('');

  // Like a use effect, but without the dep arr we can re-run the task wihtout the component executing again
  useTask$(({ track }) => {
    const value = track(() => filter.value);

    const id = setTimeout(() => {
      debouncedFilter.value = value;
    }, 300)

    return () => clearTimeout(id);
  });

  const users = useResource$(async ({ track }) => {
    track(debouncedFilter);
    return debouncedFilter.value ? await fetchUsers(debouncedFilter.value) : [];
  });
  return (
    <div>
      <h1>Github Search</h1>
      <input type="text" bind:value={filter} />
      <ul>
        <Resource
          value={users}
          onPending={() => <>loading...</>}
          onResolved={(users) => (
            <>
              {users.map((user) => (
                <ul key={user.id}>
                  <a href={`/github/${user.login}/`}>{user.login}</a>
                </ul>
              ))}
            </>
          )}
        />
      </ul>
    </div>
  );
});
