create table "public"."users" (
    "id" uuid not null,
    "email" text not null,
    "name" text,
    "type" text default 'user'::text,
    "avatar_url" text not null,
    "email_opt_in" boolean default false,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "accepted_terms_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_id_fkey1" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey1";

alter table "public"."users" add constraint "users_type_check" CHECK ((type = ANY (ARRAY['user'::text, 'vendor'::text, 'admin'::text, 'moderator'::text]))) not valid;

alter table "public"."users" validate constraint "users_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  if new.raw_user_meta_data->>'avatar_url' is null or new.raw_user_meta_data->>'avatar_url' = '' then
    new.raw_user_meta_data = jsonb_set(new.raw_user_meta_data, '{avatar_url}', '"images/auth-image.png"' ::jsonb);
  end if;
  insert into public.users (id, name, type, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Can update own user data"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Can view own user data"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));



