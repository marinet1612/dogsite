-- Demo data. Выполнять после создания пользователей через Supabase Auth удобнее частично вручную.
-- Ниже создаются публичные материалы, бренды и демонстрационные кинологи с фиктивными UUID.

insert into public.articles (title, slug, category, problem_type, dog_age_group, excerpt, content, is_published)
values
('Как выбрать кинолога для реактивной собаки', 'kak-vybrat-kinologa-dlya-reaktivnoj-sobaki', 'реактивность', 'reactivity', 'adult', 'Короткий чек-лист: что спросить у специалиста до первого занятия.', 'Для реактивной собаки важно выбирать специалиста, который работает через дистанцию, управление средой и постепенное снижение реакции. Перед началом работы уточните опыт с похожими кейсами, формат занятий, домашние задания и критерии прогресса. Не соглашайтесь на методы, основанные на запугивании или физическом подавлении.', true),
('Дневник прогресса: что фиксировать после прогулки', 'dnevnik-progressa-posle-progulki', 'дневник', 'reactivity', 'all', 'Минимальный набор полей, который помогает видеть динамику.', 'После прогулки фиксируйте дату, место, дистанцию до триггера, уровень реакции от 1 до 5, длительность восстановления и что помогло собаке. Отдельно отмечайте срывы без оценки себя или собаки: это данные, а не провал.', true),
('Параллельная прогулка без контакта', 'parallelnaya-progulka-bez-kontakta', 'прогулки', 'socialization', 'all', 'Как организовать безопасную прогулку для собак, которым пока сложно общаться напрямую.', 'Параллельная прогулка начинается на комфортной дистанции. Собаки идут в одном направлении, не подходят друг к другу и не сталкиваются лоб в лоб. Главная цель — спокойное совместное присутствие, а не игра.', true);

insert into public.brands (name, description, website_url)
values
('PawCare Market', 'Демо-партнёр с товарами для спокойных прогулок.', 'https://example.com'),
('SoftWalk', 'Демо-партнёр с амуницией для собак.', 'https://example.com');

insert into public.promo_codes (brand_id, title, description, code, target_segment, link_url, starts_at, ends_at, is_active)
select id, 'Набор для спокойной прогулки', 'Шлейка, длинный поводок и сумка для лакомств.', 'DOGRAM10', 'reactive-dogs', 'https://example.com', current_date, current_date + interval '90 days', true
from public.brands where name = 'PawCare Market';

insert into public.promo_codes (brand_id, title, description, code, target_segment, link_url, starts_at, ends_at, is_active)
select id, 'Скидка на мягкую амуницию', 'Подходит для щенков и чувствительных собак.', 'SOFTPAW15', 'puppies', 'https://example.com', current_date, current_date + interval '90 days', true
from public.brands where name = 'SoftWalk';

-- Для демонстрационных кинологов нужны связанные auth.users/profiles.
-- Проще создать 2–3 пользователя через приложение с ролью specialist, затем заполнить профили в интерфейсе и подтвердить в админке.
