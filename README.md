# PaaS

PaaS is a RESTful web service that deploys and manages your applications on AWS
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

### PUT /deployments/:stack

Requires content-type "text/yaml" and accepts a YAML file that describes the
deployment. If `:stack` does not exist, it is created. Otherwise `:stack` is
updated.

Events are output in log format as they are received.

### DELETE /deployments/:stack

If `:stack` exists, deletes it. Otherwise does nothing.

Events are output in log format as they are received.

## Examples

An entire VPC, with public and private subnets.

``` yaml
description: PaaS VPC

network:
  nat:
    ami: ami-43ee9e79
    type: t2.micro
  cidr: 10.0.0.0/16
  subnets:
    public:
      cidr:
        - 10.0.0.0/24
        - 10.0.1.0/24
      public: true
      routes:
        0.0.0.0/0: internet
    private:
      cidr:
        - 10.0.2.0/24
        - 10.0.3.0/24
      public: false
      routes:
        0.0.0.0/0: nat
```

A docker-based web application.

``` yaml
description: Example stack

vpc: vpc-330bae56

subnets:
  public:
    - subnet-5f0baa28
    - subnet-20982345
  private:
    - subnet-7d982318
    - subnet-5e0baa29

monitoring:
  type: tcp
  port: 80
  timeout: 10
  grace: 300

instances:
  ami: ami-9392faa9
  type: t2.micro
  scale: 2

containers:
  webapp:
    image: d11wtq/chriscorbyn-co-uk:2015-04-21-01
    ports: {80: 8080}
```

Eventually most of this will be optional.
