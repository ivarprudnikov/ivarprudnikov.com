---
layout: post
toc: true
title: Testing Prometheus alerts
image: /assets/prometheus-logo.png
image_caption: "Prometheus logo"
---

So you have your Prometheus set up; it scraped time-series data. 
Now you want to get notified when servers will reach some usage thresholds.

## An alert

For instance, you want to get an alert if the CPU is running high
for at least 24 hours. No problem:

```yaml
# prometheus-alerts.yaml
groups:
- name: core
  rules:
  - alert: HighCPU24
    expr: max by (instance) (irate(node_cpu_seconds_total{region="us-east-1"}[1m])) > 0.8
    for: 24h
    labels:
      severity: page
    annotations:
      summary: High CPU usage on {{$labels.instance}}
```

The question is, how do you test the above alert `HighCPU24`? One way is to deploy such 
an alert and expect that it works. Another approach could be to try and make some 
nodes or containers work harder. Hence, the processor will be busy for at least 24 hours, 
but that is a waste of resources. But one can run unit tests against these alert rules as well.

## The test

```yaml
# prometheus-alerts-test.yaml
rule_files: 
- 'prometheus-alerts.yaml' # 1
tests:
- name: 'alert HighCPU24 should be fired'
  interval: 1m # 2 every minute use one value in series
  input_series: # 3 simulate the data (starts at 0)
    - series: node_cpu_seconds_total{instance="10.0.2.9", region="us-east-1"} # 4
      values: '0+50x1500' # 5 - every minute 50sec of available 60sec CPU time is used, load is at 83%, it continues for 1500 minutes
    - series: node_cpu_seconds_total{instance="10.1.1.1", region="us-east-2"} # 4
      values: '0+10x1500' # constant ~20% load on this CPU
  alert_rule_test:
    - alertname: HighCPU24 # 6
      eval_time: 500m # 7 500th minute from start
      exp_alerts: # nothing yet
    - alertname: HighCPU24
      eval_time: 1450m # after 24hr from start
      exp_alerts: # 8
        - exp_labels:
            severity: page
            instance: 10.0.2.9
          exp_annotations:
            summary: High CPU usage on 10.0.2.9
```

From above:

1. define the files containing the alert rules that the runner will include in this test
2. specify the time interval for the values in the series, `1m` means there is a gap of one minute between 2 values
3. add the simulated time series
4. identify a metric name with its attributes
5. mock the time series values that appear between an interval (space separated values)
6. specify which alert the test targets
7. tell the point in time when the runner should expect the given details
8. what data do you wish to see at this point

[The documentation](https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/#unit-testing-for-rules) is a bit "dry" on testing. 
The hard part was to understand how the time series maps to the "interval" (I hope the comments make sense). 
Also, how the time series values will expand, e.g.: `'0+50x1500'` becomes `0 50 100 150 200 250 ...`.

## Run test with promtool

`promtool` binary is necessary to run the tests. You could use a Prometheus Docker image that has it bundled.
Just make sure to change the `entrypoint`:

```shell
#!/bin/bash -e

TEST_DIR=`pwd`
DOCKER_TMP_DIR=/tmp
PROMETHEUS_VERSION=v2.29.1

docker run --rm \
	--volume $TEST_DIR:$DOCKER_TMP_DIR \
	--workdir $DOCKER_TMP_DIR \
	--user root \
	--entrypoint /bin/promtool \
	prom/prometheus:$PROMETHEUS_VERSION test rules prometheus-alerts-test.yaml
```

`--user root` is intentional here because the testing framework needs to write temporary files to disk. 

After a successful test, you'll see:

```shell
Unit Testing:  prometheus-alerts-test.yaml
  SUCCESS
```

In a case of a failure, it looks like:

```shell
Unit Testing:  prometheus-alerts-test.yaml
  FAILED:
    name: alert HighCPU24 should be fired,
    alertname:HighCPU24, time:1d10m, 
        exp:"[Labels:{alertname=\"HighCPU24\", instance=\"9.9.9.9\", severity=\"warn\"} Annotations:{summary=\"Message\"}]", 
        got:"[Labels:{alertname=\"HighCPU24\", instance=\"10.0.2.9\", severity=\"page\"} Annotations:{summary=\"High CPU usage on 10.0.2.9\"}]"
```

## Source files

You can find the source in a public Github repo [github.com/ivarprudnikov/prometheus-alert-test](https://github.com/ivarprudnikov/prometheus-alert-test)
