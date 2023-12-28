create table posts (
  id int not null auto_increment,
  userName varchar(20) not null,
  post_text text not null,
  start_time timestamp not null default CURRENT_TIMESTAMP,
  views int default 0,
  likes int default 0,
  primary key(id)
);

create table users (
  userName varchar(20) not null,
  password text not null,
  primary key(userName)
);