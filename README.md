# env3d-jsweet

The front-end for env3d on the web.  Lessons can be found at https://env3d.github.io

# Transpiler back end

This app depends on a backend service to transpile Java code into Javascript for 
execution.  The transpiler service is setup on AWS.  Below are some notes
on how to run it aws's ecs.

# Docker Image

Use the image from https://hub.docker.com/r/env3d/transpile/ 

# ECS

The aws elastic container service can launch docker images directly, but needs some setup. 
Below is my attempt to document how to do this in the simplest way possible.

Start by going to the ECS dashboard.

## Create a cluster

First step is to create a cluster.  A cluster manages all the VM's, services,  tasks that will be running.
The most important parameters are:

 * EC2 Launch Type - way cheaper than the fargate type, and allows more transparency into the underlying VM
 * Container instance type - these are the type VM you want to use to run your containers.  Your normally
 don't need to ssh into them.
 
Once the cluster is created, you can actually see the container instances running on your EC2 dashboard.

Under the cluster status, click on the "ECS instances" and select a specific container instance.  Make note 
of the CPU and Memory that is avaliable.  You will need these parameters in the task definition.

## Task Definition

Now that the cluster is setup, we actually want to put the docker images into theses containers.  In ECS terms, 
a docker image is a "Task", so you need to first create a task definiton, which specifies things like how
much memory and cpu a container needs.  Make sure that your container can actually fit inside the EC2 VMs 
that you created in the cluster definiton by adjusting the memory and cpu requirements to be at or below
those parameters you noted from the previous step.

## Service

Go back to the clusters and select that cluster that you have created, then create a "service", which is
how tasks are grouped together.  A cluster can run multiple services, each service running one or more
copies of the same task.

Click on "Create" under the service tab, pick the EC2 launch type and select the task definiton that you
created in the previous step.  You also have the ability to create and use a load balancer.

Once the service is created, you will see the tasks launched under the "Tasks" tab.

## Conclusion

That's pretty much what you need to put your docker images into EC2 instances the easiest way.  To
make sure that your service is accessible, you can either directly access the EC2 instances or
use a load balancer (not covered in this document).
