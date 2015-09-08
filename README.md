# Hird

Hird is a RESTful web service that deploys and manages your applications on AWS
following some of the best practices used by companies with years of DevOps
experience. You keep your infrastructure within your own AWS account. You drive
that infrastructure through code. We provide the means to do that.

## Principles

  1. Cattle, not pets.
  2. Immutability.
  3. Zero-downtime deployments.
  4. High-availability.
  5. Secure hosting environments.
  6. Consistent approach.

## Reference

### PUT /api/v1/stacks/:name

Requires content-type "text/yaml" and accepts a YAML file that describes the
deployment. If `:name` does not exist, it is created. Otherwise `:name` is
updated.

Events are output in log format as they are received.

### DELETE /api/v1/stacks/:name

If `:name` exists, deletes it. Otherwise does nothing.

Events are output in log format as they are received.

### POST /api/v1/inspect/template

Receives input like `PUT /api/v1/stacks/:name`, but outputs the JSON template
that would be applied with CloudFormation.

### POST /api/v1/inspect/config

Receives input like `PUT /api/v1/stacks/:name`, but outputs the YAML config
with all default values filled in.

## Examples

An entire VPC, with public and private subnets.

``` yaml
description: Hird VPC

network:
  cidr: 10.0.0.0/16
```

A docker-based web application.

``` yaml
description: Example stack

depends: [vpc]

instances:
  scale: 2

containers:
  webapp:
    image: d11wtq/chriscorbyn-co-uk:2015-04-21-01
    ports: {80: 8080}
```

A hosted zone with some DNS records:

``` yaml
description: Hosted Zone for w3style.co.uk

zone: w3style.co.uk

domains:
  w3style.co.uk:
    MX:
      ttl: 3600
      records:
        - "1  ASPMX.L.GOOGLE.COM"
        - "5  ALT1.ASPMX.L.GOOGLE.COM"
        - "5  ALT2.ASPMX.L.GOOGLE.COM"
        - "10 ALT3.ASPMX.L.GOOGLE.COM"
        - "10 ALT4.ASPMX.L.GOOGLE.COM"
```

A Postgres database master:

``` yaml
description: Example PostgreSQL RDS DB

depends: [vpc]

database:
  engine: postgres/9.4.1
  username: postgres
  password: sergtsop
```
