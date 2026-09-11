-- The website's own logo, read from its public pages during project setup.
-- It is a display detail: editable in settings and never required.
alter table public.projects add column logo text;

create or replace function public.create_project(p_workspace uuid,p_limit int,p_data jsonb) returns public.projects language plpgsql security invoker set search_path='' as $$
 declare r public.projects;
 begin
 perform 1 from public.workspaces where id=p_workspace for update;
 if not found then raise exception 'workspace missing'; end if;
 if (select count(*) from public.projects where workspace_id=p_workspace)>=p_limit then raise exception 'project_limit'; end if;
 insert into public.projects(workspace_id,name,url,description,country,language,logo)
 values(p_workspace,p_data->>'name',p_data->>'url',p_data->>'description',p_data->>'country',p_data->>'language',nullif(p_data->>'logo',''))
 returning * into r;
 return r;
 end $$;
revoke execute on function public.create_project(uuid,int,jsonb) from public,anon,authenticated;
grant execute on function public.create_project(uuid,int,jsonb) to service_role;
