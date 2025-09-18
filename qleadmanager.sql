--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Postgres.app)
-- Dumped by pg_dump version 17.0

-- Started on 2025-09-18 14:49:49 +03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 82846)
-- Name: branch_users; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.branch_users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    branch_id character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    email character varying NOT NULL,
    generated_password character varying NOT NULL,
    role character varying DEFAULT 'staff'::character varying NOT NULL,
    is_active character varying DEFAULT 'true'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    permissions jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.branch_users OWNER TO iftikhar;

--
-- TOC entry 218 (class 1259 OID 82860)
-- Name: branches; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.branches (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    address character varying NOT NULL,
    city character varying NOT NULL,
    phone character varying NOT NULL,
    email character varying NOT NULL,
    manager_name character varying NOT NULL,
    is_active character varying DEFAULT 'true'::character varying NOT NULL,
    generated_password character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.branches OWNER TO iftikhar;

--
-- TOC entry 219 (class 1259 OID 82873)
-- Name: field_configurations; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.field_configurations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    field_name character varying NOT NULL,
    is_required boolean DEFAULT true,
    is_visible boolean DEFAULT true,
    label character varying NOT NULL,
    placeholder character varying,
    help_text character varying,
    field_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.field_configurations OWNER TO iftikhar;

--
-- TOC entry 220 (class 1259 OID 82888)
-- Name: leads; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.leads (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying NOT NULL,
    location character varying NOT NULL,
    vehicle_type character varying NOT NULL,
    vehicle_model character varying,
    rental_start_date timestamp without time zone NOT NULL,
    rental_end_date timestamp without time zone NOT NULL,
    rental_period_days integer NOT NULL,
    status character varying DEFAULT 'new'::character varying NOT NULL,
    source_type character varying DEFAULT 'website'::character varying NOT NULL,
    is_archived boolean DEFAULT false,
    special_requirements text,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_by character varying,
    assigned_branch character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.leads OWNER TO iftikhar;

--
-- TOC entry 221 (class 1259 OID 82902)
-- Name: privacy_settings; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.privacy_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    setting_key character varying NOT NULL,
    is_enabled boolean DEFAULT true,
    description character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.privacy_settings OWNER TO iftikhar;

--
-- TOC entry 222 (class 1259 OID 82915)
-- Name: sessions; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO iftikhar;

--
-- TOC entry 223 (class 1259 OID 82922)
-- Name: users; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    password character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'staff'::character varying NOT NULL,
    branch_id character varying,
    is_active text DEFAULT 'true'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    permissions jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.users OWNER TO iftikhar;

--
-- TOC entry 224 (class 1259 OID 82936)
-- Name: vehicle_makes; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.vehicle_makes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    type_id character varying NOT NULL,
    logo_url character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vehicle_makes OWNER TO iftikhar;

--
-- TOC entry 225 (class 1259 OID 82949)
-- Name: vehicle_models; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.vehicle_models (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    make_id character varying NOT NULL,
    year integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vehicle_models OWNER TO iftikhar;

--
-- TOC entry 226 (class 1259 OID 82960)
-- Name: vehicle_plates; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.vehicle_plates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    plate_number character varying NOT NULL,
    model_id character varying NOT NULL,
    color character varying,
    status character varying DEFAULT 'available'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vehicle_plates OWNER TO iftikhar;

--
-- TOC entry 227 (class 1259 OID 82974)
-- Name: vehicle_types; Type: TABLE; Schema: public; Owner: iftikhar
--

CREATE TABLE public.vehicle_types (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vehicle_types OWNER TO iftikhar;

--
-- TOC entry 3902 (class 0 OID 82846)
-- Dependencies: 217
-- Data for Name: branch_users; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.branch_users (id, branch_id, first_name, last_name, email, generated_password, role, is_active, created_at, updated_at, permissions) FROM stdin;
05f6a192-8c85-4d78-9db2-512c561a451b	e00cd76a-a98f-4338-94fb-f9fbc59c8e3e	staff1	staff1	staff1@gmail.com	HMYCAXqwEXPT	staff	true	2025-09-17 23:37:55.695757	2025-09-17 23:37:55.695757	["analytics"]
355e24a8-620b-4fef-a245-bdf3f8a19029	ac4c540d-f61f-4b83-8869-eb71ad3ff10c	HMYCAXqwEXPT	HMYCAXqwEXPT	HMYCAXqwEXPT@gmail.com	LHLwhlBfYDcJ	staff	true	2025-09-17 23:50:56.944698	2025-09-17 23:50:56.944698	["analytics"]
\.


--
-- TOC entry 3903 (class 0 OID 82860)
-- Dependencies: 218
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.branches (id, name, address, city, phone, email, manager_name, is_active, generated_password, created_at, updated_at) FROM stdin;
e00cd76a-a98f-4338-94fb-f9fbc59c8e3e	test	test	test	55523243	test@gmail.com	test	true	SdsFSk1gZeIu	2025-09-17 23:36:40.193469	2025-09-17 23:36:40.193469
ac4c540d-f61f-4b83-8869-eb71ad3ff10c	HMYCAXqwEXPT	HMYCAXqwEXPT	HMYCAXqwEXPT	HMYCAXqwEXPT	HMYCAXqwEXPT@gmail.com	HMYCAXqwEXPT	true	YzzfuQ7tcnaW	2025-09-17 23:50:44.612631	2025-09-17 23:50:44.612631
\.


--
-- TOC entry 3904 (class 0 OID 82873)
-- Dependencies: 219
-- Data for Name: field_configurations; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.field_configurations (id, field_name, is_required, is_visible, label, placeholder, help_text, field_order, created_at, updated_at) FROM stdin;
70b644a4-3c42-4db8-9da4-be9af40fa8a9	fullName	t	t	Full Name	Enter your full name	Please provide your complete name	1	2025-09-18 00:02:57.052299	2025-09-18 00:02:57.052299
2aa7b839-3aed-47fc-83ac-0e9ad5cfa929	email	t	t	Email Address	Enter your email address	We will use this to contact you	2	2025-09-18 00:02:57.055458	2025-09-18 00:02:57.055458
adc67a5f-78f3-45ea-9c50-a759fd736a9d	phone	t	t	Phone Number	Enter your phone number	Include country code if international	3	2025-09-17 20:51:46.075605	2025-09-17 21:02:57.056
ebc68374-1372-4549-a15a-9b2badf0f6b6	location	t	t	Location	Enter your location	Where do you need the vehicle?	4	2025-09-17 20:51:46.075605	2025-09-17 21:02:57.059
418fc06c-0d20-4774-a205-b7cd3897a4cc	vehicleType	t	t	Vehicle Type	Select vehicle type	Choose the type of vehicle you need	5	2025-09-17 20:51:46.075605	2025-09-17 21:02:57.06
39e0fe73-c094-4d3b-800f-40fbb037abc0	vehicleModel	f	t	Vehicle Model	Enter preferred model (optional)	Specific model preference if any	6	2025-09-18 00:02:57.063043	2025-09-18 00:02:57.063043
5b1a48aa-1bfd-4ea4-944e-6d52339b380b	rentalStartDate	t	t	Rental Start Date	Select start date	When do you need the vehicle?	7	2025-09-18 00:02:57.064374	2025-09-18 00:02:57.064374
c86a5ca2-1bd5-47a6-a30e-77e13730d566	rentalEndDate	t	t	Rental End Date	Select end date	When will you return the vehicle?	8	2025-09-18 00:02:57.065354	2025-09-18 00:02:57.065354
9ee0d387-daa6-4f79-adec-97ba9a526927	specialRequirements	f	t	Special Requirements	Any special requirements or notes	Additional requests or information	9	2025-09-18 00:02:57.067494	2025-09-18 00:02:57.067494
bfe738ba-ee3e-474e-9a91-34c7c9257d90	sourceType	f	f	Source Type	How did you hear about us?	Lead source tracking	10	2025-09-18 00:02:57.069435	2025-09-18 00:02:57.069435
\.


--
-- TOC entry 3905 (class 0 OID 82888)
-- Dependencies: 220
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.leads (id, full_name, email, phone, location, vehicle_type, vehicle_model, rental_start_date, rental_end_date, rental_period_days, status, source_type, is_archived, special_requirements, custom_fields, created_by, assigned_branch, created_at, updated_at) FROM stdin;
b204894b-7471-4900-a71b-0e65efc85869	Sheikha Al-Mayassa	sheikha.mayassa@hotmail.com	+974 5555 6037	Doha	Sedan	Audi A4	2024-04-15 00:00:00	2024-04-22 00:00:00	7	converted	website	f	Diplomatic usage - special documentation	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 20:56:42.125976
15c40b89-0625-4d76-bdb4-dcbcbb6bdea8	Amna Al-Jaber	amna.jaber@yahoo.com	+974 5555 8259	Al Wakrah	SUV	Range Rover Evoque	2024-04-25 00:00:00	2024-05-02 00:00:00	7	new	partner	f	Luxury SUV for special occasion	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 20:56:42.125976
d122dfce-6e46-4db2-acc5-206e1f5fa10e	Jassim Al-Horr	jassim.horr@outlook.com	+974 5555 9360	Lusail	Sedan	Lexus ES	2024-05-01 00:00:00	2024-05-08 00:00:00	7	converted	email	f	Executive class vehicle	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 20:56:42.125976
32d57dd7-5ce9-4c19-acfd-8b0d2075660a	Nouf Al-Darwish	nouf.darwish@gmail.com	+974 5555 0471	Al Khor	Hatchback	Mazda 2	2024-05-05 00:00:00	2024-05-10 00:00:00	5	contacted	walk_in	f	Compact car for city driving	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 20:56:42.125976
1af0a870-10df-4f91-9b63-923649a33e77	Fatima Al-Thani	fatima.thani@hotmail.com	+974 5555 2345	Al Rayyan	Sedan	Toyota Camry	2024-02-20 00:00:00	2024-02-25 00:00:00	5	contacted	phone	f	Airport pickup required	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 17:59:14.811
c124565f-55c0-4f6c-8b19-a9136d64ff63	Mohammed Al-Kuwari	mohammed.kuwari@yahoo.com	+974 5555 3456	Al Wakrah	Hatchback	Nissan Sunny	2024-02-18 00:00:00	2024-02-28 00:00:00	10	new	social_media	f	Fuel efficient vehicle preferred	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 17:59:22.816
a56a6200-6633-4d4c-8f54-3733a36eba6c	Aisha Al-Naimi	aisha.naimi@gmail.com	+974 5555 4567	Lusail	SUV	Honda CR-V	2024-02-25 00:00:00	2024-03-05 00:00:00	9	converted	referral	f	Child seat required	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 17:59:46.108
be441339-5407-4d8d-895e-d5766f2e3d3d	Moza Al-Misnad	moza.misnad@gmail.com	+974 5555 4815	Lusail	Sedan	Mercedes C-Class	2024-04-05 00:00:00	2024-04-12 00:00:00	7	contacted	email	f	Premium service package	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 18:03:52.155
ad916f25-b7dd-4cde-811c-60e4858ed8d8	Hamad Al-Ansari	hamad.ansari@outlook.com	+974 5555 5926	Al Khor	SUV	Jeep Grand Cherokee	2024-04-10 00:00:00	2024-04-17 00:00:00	7	new	email	f	Off-road capability needed	{}	\N	\N	2025-09-17 20:56:42.125976	2025-09-17 18:09:07.757
\.


--
-- TOC entry 3906 (class 0 OID 82902)
-- Dependencies: 221
-- Data for Name: privacy_settings; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.privacy_settings (id, setting_key, is_enabled, description, created_at, updated_at) FROM stdin;
8ce920b7-e522-4d1b-a128-9975beb00c74	restrict_lead_deletion	t	Restrict lead deletion to administrators only	2025-09-17 20:47:54.637902	2025-09-17 20:47:54.637902
3ccae893-b1ec-4536-a61d-c62b9772b2c9	manager_branch_isolation	t	Managers can only see leads from their assigned branch	2025-09-17 20:47:54.637902	2025-09-17 17:49:21.84
b7d716c3-d88b-4c44-bb6b-f86641500e64	data_export_restrictions	t	Restrict data export functionality to administrators only	2025-09-17 20:47:54.637902	2025-09-17 17:49:24.24
c36aedcd-7c0f-4428-b3c5-be334a279eab	hide_contact_details	f	Hide customer contact details from non-admin users	2025-09-17 20:54:46.118032	2025-09-17 20:54:46.118032
2d9d7e20-314b-4407-8f5b-315ffbdcaa76	anonymize_customer_data	f	Anonymize customer names and sensitive data for non-admin users	2025-09-17 20:54:46.119607	2025-09-17 20:54:46.119607
d8a1791d-db61-4a51-9937-e851c0480532	admin_leads_visible_to_all	f	Admin-created leads are visible to all branches and staff members	2025-09-17 20:54:46.113679	2025-09-17 20:48:40.389
d5d0c49e-75d2-4352-a41a-f68d7465c130	staff_branch_leads_access	t	Allow staff members to access leads from their assigned branch	2025-09-17 20:54:46.121253	2025-09-17 20:52:59.684
1c1a1a88-045d-4827-b7c3-faae18ac5165	staff_edit_permissions	t	Allow staff members to edit lead information	2025-09-17 20:47:54.637902	2025-09-17 20:53:00.717
a307cd73-2baa-4496-91f3-0581686abdf8	staff_own_leads_only	t	Staff members can only see leads they created	2025-09-17 20:47:54.637902	2025-09-17 20:53:01.649
\.


--
-- TOC entry 3907 (class 0 OID 82915)
-- Dependencies: 222
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- TOC entry 3908 (class 0 OID 82922)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.users (id, email, password, first_name, last_name, profile_image_url, role, branch_id, is_active, created_at, updated_at, permissions) FROM stdin;
75fc7ece-4cad-4991-abc8-cf1865ecfba8	admin@qmobility.com	YWRtaW4xMjM=	Admin	User	\N	admin	\N	true	2025-09-18 00:49:03.489113	2025-09-18 00:49:03.489113	["analytics", "users", "branches", "vehicles", "settings"]
a6e5f34c-77ad-4532-899e-6c3d357fe9e0	syed@qmobility.com	YWRtaW4xMjM0	Syed	Iftikhar	\N	admin	\N	true	2025-09-17 19:39:38.840033	2025-09-17 22:43:55.244	["analytics", "users", "branches", "vehicles", "settings"]
35fa3c9f-121f-49af-ae03-8bcd8ab490f1	syed1@qmobility.com	YWRtaW4xMjM0	syed	1	\N	admin	\N	true	2025-09-18 13:49:41.116082	2025-09-18 13:49:41.116082	["branches", "vehicles"]
420a234d-655e-49ea-a40d-a1a090691a62	syed2@qmobility.com	YWRtaW4xMjM0	syed	2	\N	admin	\N	true	2025-09-18 14:16:55.319774	2025-09-18 14:16:55.319774	["analytics"]
573639f7-8f77-4e19-ad00-ae2e446b54aa	privacy@qmobility.com	YWRtaW4xMjM0	privacy2	2	\N	admin	\N	true	2025-09-18 14:48:01.608486	2025-09-18 14:48:01.608486	["settings"]
\.


--
-- TOC entry 3909 (class 0 OID 82936)
-- Dependencies: 224
-- Data for Name: vehicle_makes; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.vehicle_makes (id, name, type_id, logo_url, is_active, created_at, updated_at) FROM stdin;
8c3c7e8b-a1e4-42b2-ba11-d674971d21cb	Mercedes-Benz	25cd488e-abc0-443b-802e-36d8b917b849	\N	t	2025-09-17 21:24:30.309917	2025-09-17 21:24:30.309917
8a02fc63-d6c3-4b2b-8133-4bc3ce98a3b7	Test	03e9c739-4e54-4de8-95f1-92330572817d		t	2025-09-17 22:06:45.932576	2025-09-17 22:06:45.932576
6be94c6b-4be8-4af1-bd09-fe5580a47c21	BMW	25cd488e-abc0-443b-802e-36d8b917b849	\N	f	2025-09-17 21:24:30.310141	2025-09-17 21:24:30.310141
9d8f9566-153b-4945-9e86-38a3798544d5	Honda	e8c4063e-d5d6-4d79-8db0-7fb324d0892e	\N	f	2025-09-17 21:24:30.309632	2025-09-17 21:24:30.309632
3bf127b5-2c50-4f32-a465-368d475b22fc	test1	1f6860b1-23ba-4fbe-aabe-775a6b1e833c	\N	t	2025-09-17 23:34:19.981261	2025-09-17 23:34:19.981261
03971380-557c-46e2-9151-cc5c7b388b23	Audii	25cd488e-abc0-443b-802e-36d8b917b849	\N	f	2025-09-17 21:24:30.310436	2025-09-17 21:22:12.84
e6802317-51ab-4544-89ab-e33ec2ccf212	Infiniti	25cd488e-abc0-443b-802e-36d8b917b849	\N	f	2025-09-17 21:24:30.311615	2025-09-17 21:22:15.103
8e366836-d090-436c-8c79-2c58f585ef9e	Toyota	6deec249-16f1-4695-9ad9-3e17d895fb9e	\N	t	2025-09-18 00:47:03.883378	2025-09-18 00:47:03.883378
3dc44462-baeb-455a-a1fa-7792dedc6919	Hyundai	6deec249-16f1-4695-9ad9-3e17d895fb9e	\N	t	2025-09-18 00:47:03.883378	2025-09-18 00:47:03.883378
13726f71-f64e-42b4-9992-50cd68a140a1	Nissan	c3c70d72-d41c-410e-8f2c-78f67c96cfe1	\N	t	2025-09-18 00:47:03.883378	2025-09-18 00:47:03.883378
\.


--
-- TOC entry 3910 (class 0 OID 82949)
-- Dependencies: 225
-- Data for Name: vehicle_models; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.vehicle_models (id, name, make_id, year, is_active, created_at, updated_at) FROM stdin;
89be84d5-f2fc-48b6-9773-2e3d3e4e4a9c	E-Class	8c3c7e8b-a1e4-42b2-ba11-d674971d21cb	2023	t	2025-09-17 21:24:30.318507	2025-09-17 21:24:30.318507
db08b0c4-ec6a-4506-a7bd-fc6a2451588d	Q50	e6802317-51ab-4544-89ab-e33ec2ccf212	2023	t	2025-09-17 21:24:30.319002	2025-09-17 21:24:30.319002
d01a5a37-9cbc-401f-b7f1-7c48a7c29fd3	GLE	8c3c7e8b-a1e4-42b2-ba11-d674971d21cb	2023	t	2025-09-17 21:24:30.319159	2025-09-17 21:24:30.319159
d7fa293d-a795-4e23-8a30-4e6517db4dca	Q7	03971380-557c-46e2-9151-cc5c7b388b23	2023	t	2025-09-17 21:24:30.319921	2025-09-17 21:24:30.319921
3aa65c2f-49b8-44c4-8101-27014752b98c	Test	8a02fc63-d6c3-4b2b-8133-4bc3ce98a3b7	2024	t	2025-09-17 22:07:00.365601	2025-09-17 22:07:00.365601
7ecc347d-172e-4abe-9095-0b158bdbd765	3 Series	6be94c6b-4be8-4af1-bd09-fe5580a47c21	2023	f	2025-09-17 21:24:30.31867	2025-09-17 21:24:30.31867
b825c182-a106-4844-9f38-458224339ce4	X5	6be94c6b-4be8-4af1-bd09-fe5580a47c21	2023	f	2025-09-17 21:24:30.319309	2025-09-17 21:24:30.319309
29a3e316-db52-4666-b12e-64617888d79f	Civic	9d8f9566-153b-4945-9e86-38a3798544d5	2023	f	2025-09-17 21:24:30.316215	2025-09-17 21:24:30.316215
c3c92c49-d4e9-4e24-8f12-072f06ee01a4	CR-V	9d8f9566-153b-4945-9e86-38a3798544d5	2023	f	2025-09-17 21:24:30.317975	2025-09-17 21:24:30.317975
cbc2d1c8-501a-4484-86a5-ea710eea33f8	CR-V	9d8f9566-153b-4945-9e86-38a3798544d5	2024	f	2025-09-17 21:48:32.20555	2025-09-17 21:48:32.20555
e185f1ba-da2f-4266-bd90-3acbead9cd59	Civic	9d8f9566-153b-4945-9e86-38a3798544d5	2024	f	2025-09-17 21:48:32.20555	2025-09-17 21:48:32.20555
a77a59c0-df60-4b9e-a840-3d130e93b4fa	Accord	9d8f9566-153b-4945-9e86-38a3798544d5	2023	f	2025-09-17 21:48:32.20555	2025-09-17 21:48:32.20555
24402c83-5011-4902-9da1-3d3811cd8be8	test	9d8f9566-153b-4945-9e86-38a3798544d5	2006	f	2025-09-17 21:24:30.318839	2025-09-17 19:15:18.919
b3639285-7a4b-4ef6-8d0d-4377bb52067a	CR-V	9d8f9566-153b-4945-9e86-38a3798544d5	2024	f	2025-09-17 22:30:37.740912	2025-09-17 22:30:37.740912
255ac99e-bc1b-4d70-a3ec-64538eb3aa33	Civic	9d8f9566-153b-4945-9e86-38a3798544d5	2024	f	2025-09-17 22:30:37.740912	2025-09-17 22:30:37.740912
f11aefea-16d9-46b5-a734-6b6f8d6b5143	test1	3bf127b5-2c50-4f32-a465-368d475b22fc	2024	t	2025-09-17 23:34:36.481421	2025-09-17 23:34:36.481421
e0d51efc-ca07-436e-bdd3-77d6439dc842	CR-V	9d8f9566-153b-4945-9e86-38a3798544d5	2024	t	2025-09-18 00:47:03.887981	2025-09-18 00:47:03.887981
d26d1dd5-a852-4cb3-b529-a0cc495f6886	Civic	9d8f9566-153b-4945-9e86-38a3798544d5	2024	t	2025-09-18 00:47:03.887981	2025-09-18 00:47:03.887981
67fe9dd8-70d6-4ee0-bbc6-368286f8f026	Accord	9d8f9566-153b-4945-9e86-38a3798544d5	2023	t	2025-09-18 00:47:03.887981	2025-09-18 00:47:03.887981
14d50d99-0b34-43a2-9e2d-02d51334493d	Prado	8e366836-d090-436c-8c79-2c58f585ef9e	2024	t	2025-09-18 00:47:03.887981	2025-09-18 00:47:03.887981
fd8913b7-aadf-4ac4-a12e-a332b7f9f54d	Camry	8e366836-d090-436c-8c79-2c58f585ef9e	2024	t	2025-09-18 00:47:03.887981	2025-09-18 00:47:03.887981
40254e99-b4e2-466d-9509-4cef3fe55fc1	Corolla	8e366836-d090-436c-8c79-2c58f585ef9e	2023	t	2025-09-18 00:47:03.887981	2025-09-18 00:47:03.887981
46f3f0b5-358c-4ba4-80ab-54dda949f20a	X-Trail	13726f71-f64e-42b4-9992-50cd68a140a1	2024	t	2025-09-18 00:47:03.887981	2025-09-18 00:47:03.887981
005abe6e-b39a-49e6-8632-08c33b3fbf7d	Altima	13726f71-f64e-42b4-9992-50cd68a140a1	2023	t	2025-09-18 00:47:03.887981	2025-09-18 00:47:03.887981
\.


--
-- TOC entry 3911 (class 0 OID 82960)
-- Dependencies: 226
-- Data for Name: vehicle_plates; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.vehicle_plates (id, plate_number, model_id, color, status, is_active, created_at, updated_at) FROM stdin;
84f075f9-963a-4c81-9766-3f94c31973f1	TEST	3aa65c2f-49b8-44c4-8101-27014752b98c	white	available	t	2025-09-17 22:07:26.905448	2025-09-17 22:07:26.905448
64d5419e-14a9-4c32-9a33-bb38d6863c16	ABC-004	29a3e316-db52-4666-b12e-64617888d79f	Blue	available	f	2025-09-17 21:48:32.20976	2025-09-17 21:48:32.20976
3545331d-3cdb-45df-be4f-bf170dfbbb13	TEST1	f11aefea-16d9-46b5-a734-6b6f8d6b5143	test1	available	t	2025-09-17 23:34:52.472251	2025-09-17 23:34:52.472251
b5950e2c-607b-4d51-905c-f7a9489135c5	ABC-002	db08b0c4-ec6a-4506-a7bd-fc6a2451588d	Silver	available	t	2025-09-18 00:47:03.890941	2025-09-18 00:47:03.890941
9ead29fd-d807-415a-93d5-b701515f3727	ABC-003	d01a5a37-9cbc-401f-b7f1-7c48a7c29fd3	Red	available	t	2025-09-18 00:47:03.890941	2025-09-18 00:47:03.890941
5a923fc8-bff9-4dee-a180-014079bfcff4	ABC-005	3aa65c2f-49b8-44c4-8101-27014752b98c	White	available	t	2025-09-18 00:47:03.890941	2025-09-18 00:47:03.890941
87e90aa9-9f35-41ac-b8ad-0f8b4e88cbd8	ABC-006	7ecc347d-172e-4abe-9095-0b158bdbd765	Black	available	t	2025-09-18 00:47:03.890941	2025-09-18 00:47:03.890941
364b3e3e-bd60-4607-b079-685e13e9ad4e	ABC-007	b825c182-a106-4844-9f38-458224339ce4	Silver	available	t	2025-09-18 00:47:03.890941	2025-09-18 00:47:03.890941
9a9f4c69-8511-4d5f-8919-eacbfe68261c	ABC-008	29a3e316-db52-4666-b12e-64617888d79f	Red	available	t	2025-09-18 00:47:03.890941	2025-09-18 00:47:03.890941
36e9a97b-2fc1-40b2-88b0-783de4c980e7	ABC-009	c3c92c49-d4e9-4e24-8f12-072f06ee01a4	Blue	available	t	2025-09-18 00:47:03.890941	2025-09-18 00:47:03.890941
c6a3706f-cc50-4a24-8a12-36bb529c718b	ABC-010	cbc2d1c8-501a-4484-86a5-ea710eea33f8	White	available	t	2025-09-18 00:47:03.890941	2025-09-18 00:47:03.890941
c9b01b3d-dbfc-4ee2-80f0-262f2afe7daa	ABC-001	89be84d5-f2fc-48b6-9773-2e3d3e4e4a9c	Black	available	f	2025-09-18 00:47:03.890941	2025-09-18 11:32:05.265
\.


--
-- TOC entry 3912 (class 0 OID 82974)
-- Dependencies: 227
-- Data for Name: vehicle_types; Type: TABLE DATA; Schema: public; Owner: iftikhar
--

COPY public.vehicle_types (id, name, description, is_active, created_at, updated_at) FROM stdin;
ec3707b6-523d-48fb-a626-dc4c757a57e2	Premium SUV	High-end SUVs	f	2025-09-17 21:24:30.303713	2025-09-17 21:24:30.303713
9a19689d-c10a-4536-9553-f77b1736e724	Hatchbackkk	Compact car with rear door	f	2025-09-17 21:48:32.197373	2025-09-17 21:19:08.85
25cd488e-abc0-443b-802e-36d8b917b849	Luxury	Premium luxury vehicles	f	2025-09-17 21:24:30.303272	2025-09-17 21:19:17.294
a408139c-182f-49d6-865a-86c61a915c10	Mid-size	Medium sized comfortable cars	f	2025-09-17 21:24:30.302284	2025-09-17 21:19:26.045
4fe2f0d9-b7cd-498e-ae14-22b7ba4813bc	Pickup	Pickup truck	f	2025-09-17 21:48:32.197373	2025-09-17 21:21:44.562
6deec249-16f1-4695-9ad9-3e17d895fb9e	Sedan	Four-door passenger car	f	2025-09-17 21:48:32.197373	2025-09-17 21:21:45.868
b0a4b26f-5edf-4946-8bc3-5993c9f6eee2	test	test	f	2025-09-17 23:33:59.833897	2025-09-17 21:21:47.12
03e9c739-4e54-4de8-95f1-92330572817d	Test	TEst	f	2025-09-17 22:06:27.258215	2025-09-17 21:21:47.852
1f6860b1-23ba-4fbe-aabe-775a6b1e833c	test1	test1	f	2025-09-17 23:34:10.830393	2025-09-17 21:21:48.317
eaac8a1b-6be9-41ae-8b17-b6b621a0e933	Van	Large passenger or cargo vans	f	2025-09-17 21:24:30.304221	2025-09-17 21:21:49.202
cc77bfbe-f925-4006-9003-0befe8556407	tetts	tetss	t	2025-09-18 00:36:54.099324	2025-09-18 00:36:54.099324
c3c70d72-d41c-410e-8f2c-78f67c96cfe1	SUV	Sport Utility Vehicle	t	2025-09-18 00:47:03.877894	2025-09-18 00:47:03.877894
d97359ea-2a67-4937-a4b8-005a54adce2f	Hatchback	Compact car with rear door	t	2025-09-18 00:47:03.877894	2025-09-18 00:47:03.877894
8c212091-9ca9-44b3-932a-764bb5bbe115	testtesttest	testtesttest	f	2025-09-18 00:54:57.431391	2025-09-17 21:55:20.195
e8c4063e-d5d6-4d79-8db0-7fb324d0892e	Compact	Small to medium sized cars	t	2025-09-17 21:24:30.301372	2025-09-18 06:30:09.274
90ea5701-4ced-4eb2-89f4-23f109046e32	tes	test	f	2025-09-18 00:29:35.687252	2025-09-18 11:40:10.881
\.


--
-- TOC entry 3715 (class 2606 OID 82859)
-- Name: branch_users branch_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.branch_users
    ADD CONSTRAINT branch_users_email_unique UNIQUE (email);


--
-- TOC entry 3717 (class 2606 OID 82857)
-- Name: branch_users branch_users_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.branch_users
    ADD CONSTRAINT branch_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3719 (class 2606 OID 82872)
-- Name: branches branches_email_unique; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_email_unique UNIQUE (email);


--
-- TOC entry 3721 (class 2606 OID 82870)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 3723 (class 2606 OID 82887)
-- Name: field_configurations field_configurations_field_name_unique; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.field_configurations
    ADD CONSTRAINT field_configurations_field_name_unique UNIQUE (field_name);


--
-- TOC entry 3725 (class 2606 OID 82885)
-- Name: field_configurations field_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.field_configurations
    ADD CONSTRAINT field_configurations_pkey PRIMARY KEY (id);


--
-- TOC entry 3727 (class 2606 OID 82901)
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- TOC entry 3729 (class 2606 OID 82912)
-- Name: privacy_settings privacy_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.privacy_settings
    ADD CONSTRAINT privacy_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3731 (class 2606 OID 82914)
-- Name: privacy_settings privacy_settings_setting_key_unique; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.privacy_settings
    ADD CONSTRAINT privacy_settings_setting_key_unique UNIQUE (setting_key);


--
-- TOC entry 3734 (class 2606 OID 82921)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- TOC entry 3736 (class 2606 OID 82935)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3738 (class 2606 OID 82933)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 82948)
-- Name: vehicle_makes vehicle_makes_name_unique; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_makes
    ADD CONSTRAINT vehicle_makes_name_unique UNIQUE (name);


--
-- TOC entry 3742 (class 2606 OID 82946)
-- Name: vehicle_makes vehicle_makes_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_makes
    ADD CONSTRAINT vehicle_makes_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 82959)
-- Name: vehicle_models vehicle_models_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT vehicle_models_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 82971)
-- Name: vehicle_plates vehicle_plates_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_plates
    ADD CONSTRAINT vehicle_plates_pkey PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 82973)
-- Name: vehicle_plates vehicle_plates_plate_number_unique; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_plates
    ADD CONSTRAINT vehicle_plates_plate_number_unique UNIQUE (plate_number);


--
-- TOC entry 3750 (class 2606 OID 82986)
-- Name: vehicle_types vehicle_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_types
    ADD CONSTRAINT vehicle_types_name_unique UNIQUE (name);


--
-- TOC entry 3752 (class 2606 OID 82984)
-- Name: vehicle_types vehicle_types_pkey; Type: CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_types
    ADD CONSTRAINT vehicle_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3732 (class 1259 OID 83007)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: iftikhar
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- TOC entry 3753 (class 2606 OID 82987)
-- Name: branch_users branch_users_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.branch_users
    ADD CONSTRAINT branch_users_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- TOC entry 3754 (class 2606 OID 82992)
-- Name: vehicle_makes vehicle_makes_type_id_vehicle_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_makes
    ADD CONSTRAINT vehicle_makes_type_id_vehicle_types_id_fk FOREIGN KEY (type_id) REFERENCES public.vehicle_types(id);


--
-- TOC entry 3755 (class 2606 OID 82997)
-- Name: vehicle_models vehicle_models_make_id_vehicle_makes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT vehicle_models_make_id_vehicle_makes_id_fk FOREIGN KEY (make_id) REFERENCES public.vehicle_makes(id);


--
-- TOC entry 3756 (class 2606 OID 83002)
-- Name: vehicle_plates vehicle_plates_model_id_vehicle_models_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: iftikhar
--

ALTER TABLE ONLY public.vehicle_plates
    ADD CONSTRAINT vehicle_plates_model_id_vehicle_models_id_fk FOREIGN KEY (model_id) REFERENCES public.vehicle_models(id);


-- Completed on 2025-09-18 14:49:49 +03

--
-- PostgreSQL database dump complete
--

